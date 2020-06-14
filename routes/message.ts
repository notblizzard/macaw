import { Router, Request } from "express";
import { User, Message, Like } from "../models";
import Repost from "../models/Repost";
import uploader from "../uploader";
import { In } from "typeorm";
import passport from "passport";

interface RequestUser extends Request {
  id: number;
  username: string;
  email: string;
}

interface ProfileUser extends User {
  isFollowingUser?: boolean;
  isAuthorized?: boolean;
  isDifferentUser?: boolean;
  messageCount?: number;
}
interface ProfileUserMessage extends Message {
  liked?: boolean;
  reposted?: boolean;
  messageCreatedAt?: Date;
}
const router = Router();

const wasRepostedByUser = (message: Message, user: User): boolean => {
  return user.reposts.map((repost) => repost.message.id).includes(message.id);
};

const getReposts = (reposts: Repost[], messages: Message[]): Message[] => {
  const repostIds: number[] = reposts.map((repost) => repost.message.id);
  messages.map((message: ProfileUserMessage) => {
    if (repostIds.includes(message.id)) {
      message.reposted = true;
      message.messageCreatedAt = message.createdAt;
      message.createdAt = reposts.filter((repost) => {
        return repost.message.id === message.id;
      })[0].createdAt;
    }
    return message;
  });
  return messages;
};

const getLikes = (messages: Message[], authUser: ProfileUser): Message[] => {
  const likeIds: number[] = authUser.likes.map((like) => like.message.id);
  messages.map((message: ProfileUserMessage) => {
    message.liked = likeIds.includes(message.id);
    return message;
  });
  return messages;
};

const getPinned = async (
  messages: Message[],
  pinId: number,
  skip: number,
): Promise<Message[] | boolean> => {
  const messagePinned: Message | undefined = await Message.findOne({
    where: { id: pinId },
    relations: ["user", "likes", "reposts"],
  });
  if (!messagePinned) return false;
  if (skip === 1) {
    messages = messages.filter((message) => message.id !== messagePinned.id);
    messages.unshift(messagePinned);
  }
  return messages;
};

router.get("/api/message/search", async (req, res) => {
  const skip = Number(req.query.page);
  const qs = `%${req.query.qs}%`;

  let messages: Message[] = await Message.createQueryBuilder("message")
    .where("message.data ILIKE :qs", { qs })
    .leftJoinAndSelect("message.user", "messageUser")
    .leftJoinAndSelect("message.reposts", "messageReposts")
    .leftJoinAndSelect("message.likes", "messageLikes")
    .leftJoinAndSelect("messageLikes.user", "messageLikesUser")
    .leftJoinAndSelect("messageLikesUser.messages", "likesUserMessages")
    .leftJoinAndSelect("messageLikesUser.likes", "likesUserLikes")
    .leftJoinAndSelect("messageLikesUser.reposts", "likesUserRepost")
    .skip((skip - 1) * 10)
    .take(10)
    .getMany();

  // manually sort messages
  messages = messages.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  if (req.user) {
    // user exists. no need to check if undefined.
    const authUser: User | undefined = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: [
        "following",
        "following.following",
        "following.follower",
        "likes",
        "likes.message",
      ],
    });
    messages = getLikes(messages, authUser as User);
  }
  // only get list of users if user is on first page
  if (skip === 1) {
    const users: User[] = await User.createQueryBuilder("user")
      .where("user.username ILIKE :qs", { qs })
      .orWhere("user.displayname ILIKE :qs", { qs })
      .leftJoinAndSelect("user.messages", "userMessages")
      .leftJoinAndSelect("user.followers", "userFollowers")
      .leftJoinAndSelect("user.following", "userFollowing")
      .take(3)
      .getMany();
    return res.json({ success: true, users, messages });
  } else {
    return res.json({ success: true, messages });
  }
});

router.post(
  "/api/message/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user: User | undefined = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["pinned"],
    });

    if (!user) {
      return res.json({ success: false, error: "user does not exist." });
    }

    const message: Message | undefined = await Message.findOne({
      where: { id: req.body.id },
      relations: ["user"],
    });

    if (!message) {
      return res.json({ success: false, error: "message does not exist." });
    }
    if (message.user.id !== (req.user as RequestUser).id) {
      return res.json({
        success: false,
        error: "you are not the owner of this message.",
      });
    }
    if (user.pinned.id === message.id) await user.pinned.remove();
    const messageId = message.id;
    await message.remove();
    return res.json({ success: true, messageId });
  },
);

router.get("/api/message/explore", async (req, res) => {
  const skip = Number(req.query.page);

  let messages: Message[] = await Message.find({
    relations: [
      "user",
      "likes",
      "reposts",
      "likes.user",
      "likes.user.messages",
      "likes.user.likes",
      "likes.user.reposts",
    ],
    order: {
      createdAt: "DESC",
    },
    skip: (skip - 1) * 10,
    take: 10,
  });

  if (req.user) {
    const user: User | undefined = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: [
        "following",
        "following.following",
        "following.follower",
        "likes",
        "likes.message",
        "reposts",
        "reposts.message",
      ],
    });
    if (!user) return false;
    messages = getLikes(messages, user as User);
    messages = getReposts(user?.reposts, messages);
    return res.json({ success: true, user, messages });
  }
  return res.json({ success: true, messages });
});

router.get(
  "/api/message/dashboard",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user) return res.json({ success: false, error: "invalid user" });
    const skip = Number(req.query.page);
    const relations = [
      "followers",
      "following",
      "following.following",
      "reposts",
      "likes",
      "likes.message",
      "likes.user",
      "likes.user.messages",
      "likes.user.reposts",
      "likes.user.likes",
      "reposts.message",
      "reposts.user",
    ];
    skip === 1 && relations.push("pinned");
    const user: ProfileUser | undefined = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations,
      select: ["displayname", "id", "color"],
    });

    if (!user) return res.json({ success: false, error: "user doesn't exist" });
    const repostsIds: number[] = user.reposts.map((x) => x.message.id);
    const followingUserIds: number[] = user.following.map(
      (follow) => follow.following.id,
    );
    console.log(followingUserIds);
    let messages: Message[] = await Message.find({
      where: [
        { userId: user.id },
        { userId: In(followingUserIds.length ? followingUserIds : [0]) },
        { id: In(repostsIds.length ? repostsIds : [0]) },
      ],
      relations: [
        "user",
        "likes",
        "reposts",
        "likes.user",
        "likes.user.messages",
        "likes.user.likes",
        "likes.user.reposts",
      ],
      order: {
        createdAt: "DESC",
      },
      skip: (skip - 1) * 10,
      take: 10,
    });

    if (messages.length === 0 && skip > 1) {
      return res.json({
        success: false,
        error: "no more messages.",
      });
    }
    messages = getReposts(user.reposts, messages);
    messages = getLikes(messages, user);

    // resort messages
    messages = messages.sort(
      (a, b) => Number(b.createdAt) - Number(a.createdAt),
    );
    if (user.pinned && skip === 1) {
      // pinned message does exist, so we can skip the boolean check.
      messages = (await getPinned(messages, user.pinned.id, skip)) as Message[];
    }
    user.isDifferentUser = false;
    return res.json({ success: true, user, messages });
  },
);

router.get("/api/message/dialog", async (req, res) => {
  const message: ProfileUserMessage | undefined = await Message.findOne({
    where: { id: req.query.id }, // messageId
    relations: [
      "user",
      "likes",
      "reposts",
      "likes.user",
      "likes.user.messages",
      "likes.user.likes",
      "likes.user.reposts",
    ],
    order: {
      createdAt: "ASC",
    },
  });
  if (!message) {
    return res.json({ success: false, error: "message does not exist." });
  }
  if (req.user) {
    const user = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["reposts", "likes", "reposts.message"],
    });
    if (wasRepostedByUser(message, user!)) {
      message.messageCreatedAt = message.createdAt;
      message.createdAt = user?.reposts.filter((repost) => {
        return repost.message.id === message.id;
      })[0].createdAt!;
    }
  }
  return res.json({ success: true, message });
});

router.get("/api/message/profile", async (req, res) => {
  const skip = Number(req.query.page);
  const relations = [
    "followers",
    "following",
    "reposts",
    "likes",
    "likes.message",
    "likes.user",
    "likes.user.messages",
    "likes.user.reposts",
    "likes.user.likes",
    "reposts.message",
    "reposts.user",
  ];
  // only get pinned message if user is viewing first page
  skip === 1 && relations.push("pinned");

  // cleaner to get the username first
  const username: string | undefined = await User.createQueryBuilder("user")
    .where("user.username ILIKE :username", { username: req.query.username })
    .getOne()
    .then((user) => user?.username);

  if (!username) {
    return res.json({ success: false, error: "user does not exist." });
  }

  const user: ProfileUser | undefined = await User.findOne({
    where: { username },
    relations,
    select: ["displayname", "id", "color"],
  });

  if (!user) return res.json({ success: false, error: "No user" });

  let messages = await Message.find({
    where: [{ userId: user.id }],
    relations: [
      "user",
      "likes",
      "reposts",
      "likes.user",
      "likes.user.messages",
      "likes.user.likes",
      "likes.user.reposts",
    ],
    order: {
      createdAt: "DESC",
    },
    skip: (skip - 1) * 10,
    take: 10,
  });

  if (messages.length === 0 && skip > 1) {
    return res.json({
      success: false,
      error: "no more messages.",
    });
  }

  messages = getReposts(user.reposts, messages);

  if (user.pinned) {
    messages = (await getPinned(messages, user.pinned.id, skip)) as Message[];
  }
  if (req.user) {
    // see if the current auth user liked any messages the ':username' has made.
    const authUser: User | undefined = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: [
        "following",
        "following.following",
        "following.follower",
        "likes",
        "likes.message",
      ],
    });
    messages = getLikes(messages, authUser as User);
    // todo fix | user.isFollowingUser =
    user.isDifferentUser = user.id !== (req.user as RequestUser).id;
  }
  return res.json({ success: true, user, messages });
});

router.post(
  "/api/message/new",
  uploader.single("file"),
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user: User | undefined = await User.findOne({
      username: (req.user as RequestUser).username,
    });
    if (!user) return res.json({ error: "User does not exist." });

    const message: Message = new Message();
    message.data = req.body.data;
    message.user = user;
    message.file = req.file?.filename;

    await message.save();
    return res.json({ success: true, id: message.id });
  },
);

router.post(
  "/api/message/pin",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user: User | undefined = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["reposts", "reposts.message", "messages"],
    });
    if (!user)
      return res.json({ success: false, error: "user does not exist" });
    const message: Message | undefined = await Message.findOne({
      where: { id: req.body.id },
      relations: ["likes", "user"],
    });
    if (!message) {
      return res.json({ success: false, error: "message does not exist." });
    }
    // check if user actually owns the message
    if (user.messages.map((m) => m.id).includes(message.id)) {
      user.pinned = message as Message;
      await user.save();
      return res.json({ success: true, pin: true, pinned: user.pinned });
    } else {
      return res.json({
        success: false,
        erorr: "message isn't owned by user",
      });
    }
  },
);

router.post(
  "/api/message/repost",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user: User | undefined = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["reposts"],
    });
    if (!user)
      return res.json({ success: false, error: "user does not exist" });
    const message: Message | undefined = await Message.findOne({
      where: { id: req.body.id },
      relations: ["likes", "user"],
    });
    if (message) {
      let repost: Repost | undefined = await Repost.findOne({
        where: { user, message },
        relations: ["user", "message"],
      });
      if (repost) {
        const repostId = repost.id; // to remove with filter in the client
        await repost.remove();
        return res.json({ success: true, reposted: false, repostId });
      } else {
        repost = new Repost();
        repost.message = message;
        repost.user = user;
        await repost.save();
        return res.json({ success: true, reposted: true, repost });
      }
    } else {
      return res.json({ success: false, error: "message does not exist." });
    }
  },
);

router.post(
  "/api/message/like",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user: User | undefined = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["likes"],
    });
    if (!user) return false;
    if (user.id !== (req.user as RequestUser).id) return false;

    const message: Message | undefined = await Message.findOne({
      where: { id: req.body.id },
      relations: ["likes", "user"],
    });
    if (!message) {
      return res.json({ success: false, error: "message does not exist." });
    }
    if (message.user.id === user.id) {
      // can't like your own message.
      return res.json({
        success: false,
        error: "you can't like your own message",
      });
    }

    let like: Like | undefined = await Like.findOne({
      where: { user, message },
      relations: ["user", "message"],
    });
    if (like) {
      const likeId: number = like.id; // to remove the like by filter in the client.
      await like.remove();
      return res.json({ success: true, liked: false, likeId });
    } else {
      like = new Like();
      like.user = user;
      like.message = message;
      await like.save();

      return res.json({ success: true, liked: true, like });
    }
  },
);

export default router;
