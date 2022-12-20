import { Router } from "express";
import { User, Follow } from "../models";
import { validate } from "class-validator";
import { Request } from "express";
import { passport } from "../authorization";
import { Like } from "typeorm";
import Notification from "../models/Notification";

interface RequestUser extends Request {
  id: number;
  email: string;
  username: string;
}

interface Errors {
  [key: string]: string[];
}

interface ProfileUser extends User {
  isAuthorized?: boolean;
  isDifferentUser?: boolean;
  isFollowingUser?: boolean;
  messageCount?: number;
  message?: [];
}

interface FollowUser extends Follow {
  isBeingFollowed?: boolean;
}

const router = Router();

router.get(
  "/api/user/dashboard",
  passport.authenticate("jwt"),
  async (req, res) => {
    const user: ProfileUser | null = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["following", "followers", "messages"],
    });
    if (!user) {
      return res.json({ success: false, error: "user does not exist." });
    }
    user.messageCount = user.messages.length;
    delete (user as any).messages;
    return res.json({ success: true, user });
  },
);

router.get(
  "/api/user/notifications",
  passport.authenticate("jwt"),
  async (req, res) => {
    const count = req.query.count;
    if (count) {
      const user: ProfileUser | null = await User.findOne({
        where: { id: (req.user as RequestUser).id },
        relations: ["notifications"],
      })!;

      // console.log(user?.notifications);

      return res.json({
        success: true,
        notifications: user?.notifications.filter((notification) => {
          return notification.unread;
        }).length,
      });
    } else {
      const user: ProfileUser | null = await User.findOne({
        where: { id: (req.user as RequestUser).id },
        relations: [
          "notifications",
          "notifications.targetUser",
          "notifications.originUser",
          "notifications.message",
        ],
      });

      console.log(user);
      // set all unread messages to read
      /* user!.notifications = user!.notifications.map((notification) => {
        notification.unread = false;
        return notification;
      });*/
      // console.log(user);
      await Notification.createQueryBuilder()
        .update(Notification)
        .set({ unread: false })
        .where({ targetUser: user })
        .execute();
      // await User.createQueryBuilder("user").update(User).set({});
      //await user!.save();
      //console.log(user);
      return res.json({
        success: true,
        notifications: user!.notifications,
      });
    }
  },
);

router.get(
  "/api/user/notification-count",
  passport.authenticate("jwt"),
  async (req, res) => {
    const user: ProfileUser | null = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["notifications"],
    })!;
    return res.json({
      success: true,
      notifications: user?.notifications.length,
    });
  },
);

router.get("/api/user/profile", async (req, res) => {
  // cleaner to get the username first
  const username: string | undefined = await User.createQueryBuilder("user")
    .where("user.username ILIKE :username", { username: req.query.username })
    .getOne()
    .then((user) => user?.username);

  if (!username) {
    return res.json({ success: false, error: "user does not exist." });
  }

  const user: ProfileUser | null = await User.findOne({
    where: { username },
    relations: ["following", "followers", "messages"],
  })!;
  if (!user)
    return res.json({
      success: false,
      error: "user does not exist",
    });
  user.messageCount = user.messages.length;
  delete (user as any).messages;

  if (req.user) {
    const authUser: User | null = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["following", "following.following"],
    });
    if (!authUser) return false;

    user.isDifferentUser = authUser.id !== user.id;
    user.isFollowingUser = authUser.following
      .map((following) => following.following.id)
      .includes(user.id);
  }

  return res.json({
    success: true,
    user,
  });
});

router.get(
  "/api/user/authenticate",
  passport.authenticate("jwt"),
  async (req, res) => {
    const user = req.user as RequestUser;
    return res.json({ success: true, id: user.id, username: user.username });
  },
);
router.get(
  "/api/user/color",
  passport.authenticate("jwt"),
  async (req, res) => {
    if (!req.user) return res.json({ success: true, color: "default" });
    const user: User | null = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      select: ["color"],
    });
    if (!user)
      return res.json({ success: false, error: "user does not exist." });
    return res.json({ success: true, color: user.color, id: user.id });
  },
);

router.get("/api/user/followers", async (req, res) => {
  const user: ProfileUser | null = await User.findOne({
    where: { username: Like(req.query.username as string) },
    relations: [
      "followers",
      "followers.follower",
      "followers.follower.messages",
      "followers.follower.followers",
      "followers.follower.following",
    ],
  });
  if (!user) return res.json({ success: false, error: "invalid user" });
  if (req.user) {
    const authUser: User | null = await User.findOne({
      where: { id: (req.user as RequestUser).id },
    });
    if (!authUser) return false;

    user.followers.map((follow: FollowUser) => {
      follow.isBeingFollowed = authUser.following
        .map((following) => following.following.id)
        .includes(follow.following.id);
    });
  }

  return res.json({ success: true, user });
});

router.get("/api/user/following", async (req, res) => {
  const user: ProfileUser | null = await User.findOne({
    where: { username: Like(req.query.username as string) },
    relations: [
      "following",
      "following.following",
      "following.following.messages",
      "following.following.followers",
      "following.following.following",
    ],
  });
  if (!user) return res.json({ success: false, error: "invalid user" });
  if (req.user) {
    const authUser: User | null = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["following", "following.following"],
    });
    if (!authUser) return false;

    user.following.map((follow: FollowUser) => {
      follow.isBeingFollowed = authUser.following
        .map((following) => following.following.id)
        .includes(follow.following.id);
    });
  }

  return res.json({ success: true, user });
});
router.get("/api/user/tooltip", async (req, res) => {
  const username: string | undefined = (
    await User.createQueryBuilder("user")
      .where("user.username ILIKE :username", { username: req.query.username })
      .getOne()
  )?.username;

  //.then((x) => x.username);
  if (!username) return res.json({ error: "user doesnt exist" });
  const user: ProfileUser | null = await User.findOne({
    where: { username: username },
    relations: ["messages", "followers", "following", "reposts", "likes"],
    select: [
      "link",
      "description",
      "location",
      "username",
      "displayname",
      "createdAt",
      "color",
      "id",
      "email",
    ],
  });
  if (!user) return false;
  if (req.user) {
    const authUser: User | null = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["following", "following.following"],
    });
    if (!authUser) return false;

    user.isDifferentUser = authUser.id !== user.id;
    user.isFollowingUser = authUser.following
      .map((following) => following.following.id)
      .includes(user.id);
  }
  return res.json({ success: true, user: user });
});

router.get(
  "/api/user/settings/default",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (!req.user) return res.json({ success: false, error: "no user." });
    return res.json({ success: true, user: req.user });
  },
);

router.post(
  "/api/user/settings/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const errorList: Errors = {};
    console.log(req.user as RequestUser);
    const user: User | null = await User.findOne({
      where: { id: (req.user as RequestUser).id },
    });
    if (!user) return false;
    if (user.id !== user.id) {
      return res.json({ success: false, error: "invalid user" }); //todo
    }
    user.username = req.body.username;
    user.description = req.body.description;
    user.displayname = req.body.displayname;
    user.location = req.body.location;
    user.link = req.body.link;
    user.color = req.body.color;
    validate(user, { validationError: { target: false } }).then(
      async (errors) => {
        if (errors.length > 0) {
          /*errors.map((error) => {
            errorList[error.property] = Object.values(error.constraints);
          });
          return res.json({ success: false, errors: errorList });*/
        }
        try {
          await user.save();
          return res.json({ success: true, user });
        } catch (e: any) {
          if (
            e.name === "QueryFailedError" &&
            e.detail.includes("already exists.")
          ) {
            // unique username
            errorList.username = ["username already exists."];
            return res.json({ success: false, errors: errorList });
          }
        }
      },
    );
  },
);

router.post(
  "/api/user/follow",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const userThatWillBeFollowing: User | null = await User.findOne({
      where: { id: (req.user as RequestUser).id },
    });
    if (!userThatWillBeFollowing) {
      return res.json({ success: false, error: "user does not exist." });
    }
    const userThatWillBeFollowed: User | null = await User.findOne(req.body.id);
    if (!userThatWillBeFollowed)
      return res.json({
        success: false,
        error: "user attempting to be followed does not exist.",
      });

    const follow: Follow | null = await Follow.findOne({
      where: {
        follower: {
          id: userThatWillBeFollowing.id,
        },
        following: {
          id: userThatWillBeFollowed.id,
        },
      },
    });
    if (follow) {
      await follow.remove();
      return res.json({ success: true, following: false });
    } else {
      const newFollow: Follow = new Follow();
      newFollow.follower = userThatWillBeFollowing;
      newFollow.following = userThatWillBeFollowed;
      await newFollow.save();
      return res.json({ success: true, following: true });
    }
  },
);

export default router;
