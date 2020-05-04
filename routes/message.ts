import { Router, Request } from "express";
import { User, Message, Like } from "../models";
import Repost from "../models/Repost";
import uploader from "../uploader";
import { Like as TypeORMLike, In } from "typeorm";
import passport from "passport";
import Conversation from "../models/Conversation";
import ConversationMessage from "../models/ConversationMessage";

const router = Router();

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
): Promise<Message[]> => {
  const messagePinned = await Message.findOne({
    where: { id: pinId },
    relations: ["user", "likes", "reposts"],
  });
  if (skip === 1) {
    messages = messages.filter((message) => message.id !== messagePinned.id);
    messages.unshift(messagePinned);
  }
  return messages;
};

interface RequestUser extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
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

router.get("/api/message/search", async (req: RequestUser, res) => {
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
    const authUser: User = await User.findOne({
      where: { id: req.user.id },
      relations: [
        "following",
        "following.following",
        "following.follower",
        "likes",
        "likes.message",
      ],
    });
    messages = getLikes(messages, authUser);
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
  async (req: RequestUser, res) => {
    if (!req.user) return res.json({ success: false, error: "invalid user." });

    const user: User = await User.findOne({
      where: { id: req.user.id },
      relations: ["pinned"],
    });

    const message: Message = await Message.findOne({
      where: { id: req.body.id },
      relations: ["user"],
    });

    if (!message) {
      return res.json({ success: false, error: "message does not exist." });
    }
    if (message.user.id !== req.user.id) {
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

router.get(
  "/api/message/dashboard",
  passport.authenticate("jwt", { session: false }),
  async (req: RequestUser, res) => {
    if (!req.user) return res.json({ success: false, error: "invalid user" });
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
    skip === 1 && relations.push("pinned");
    const user: ProfileUser = await User.findOne({
      where: { id: req.user.id },
      relations,
      select: ["displayname", "id", "color"],
    });

    if (!user) return res.json({ success: false, error: "user doesn't exist" });
    const repostsIds: number[] = user.reposts.map((x) => x.message.id);

    let messages: Message[] = await Message.find({
      where: [
        { userId: user.id },
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
      messages = await getPinned(messages, user.pinned.id, skip);
    }
    user.isDifferentUser = false;
    return res.json({ success: true, user, messages });
  },
);

router.get("/api/message/dialog", async (req: RequestUser, res) => {
  const message: Message = await Message.findOne({
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
  return res.json({ success: true, message });
});

router.get("/api/message/profile", async (req: RequestUser, res) => {
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

  const user: ProfileUser = await User.findOne({
    where: { username: TypeORMLike(req.query.username) },
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

  if (user.pinned) messages = await getPinned(messages, user.pinned.id, skip);

  if (req.user) {
    // see if the current auth user liked any messages the ':username' has made.
    const authUser: User = await User.findOne({
      where: { id: req.user.id },
      relations: [
        "following",
        "following.following",
        "following.follower",
        "likes",
        "likes.message",
      ],
    });
    messages = getLikes(messages, authUser);
    // todo fix | user.isFollowingUser =
    user.isDifferentUser = user.id !== req.user.id;
  }
  return res.json({ success: true, user, messages });
});

router.post(
  "/api/message/new",
  uploader.single("file"),
  passport.authenticate("jwt", { session: false }),
  async (req: RequestUser, res) => {
    if (!req.user) return res.json({ error: "Invalid auth." });

    const user: User = await User.findOne({ username: req.user.username });
    if (!user) return res.json({ error: "User does not exist." });

    const message: Message = new Message();
    message.data = req.body.data;
    message.user = user;
    message.file = req.file?.filename;

    await message.save();
    return res.json({ success: true, message });
  },
);

router.post(
  "/api/message/pin",
  passport.authenticate("jwt", { session: false }),
  async (req: RequestUser, res) => {
    const user: User = await User.findOne({
      where: { id: req.user.id },
      relations: ["reposts", "reposts.message", "messages"],
    });
    if (!user)
      return res.json({ success: false, error: "user does not exist" });
    const message: Message = await Message.findOne({
      where: { id: req.body.id },
      relations: ["likes", "user"],
    });

    // check if user actually owns the message
    if (user.messages.map((m) => m.id).includes(message.id)) {
      user.pinned = message;
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
  async (req: RequestUser, res) => {
    const user: User = await User.findOne({
      where: { id: req.user.id },
      relations: ["reposts"],
    });
    if (!user)
      return res.json({ success: false, error: "user does not exist" });
    const message: Message = await Message.findOne({
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
  async (req: RequestUser, res) => {
    const user: User = await User.findOne({
      where: { id: req.user.id },
      relations: ["likes"],
    });
    if (user.id !== req.user.id) return false;

    const message: Message = await Message.findOne({
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
