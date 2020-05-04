import { Router } from "express";
import { User, Message } from "../models";
import { validate } from "class-validator";
import { Request } from "express";
import { passport } from "../authorization";
import Follow from "../models/Follow";
import { Like } from "typeorm";

interface RequestUser extends Request {
  user: any;
}

interface ProfileUser extends User {
  isAuthorized?: boolean;
  isDifferentUser?: boolean;
  isFollowingUser?: boolean;
  messageCount?: number;
}

interface FollowUser extends Follow {
  isBeingFollowed?: boolean;
}

const router = Router();

router.get("/api/user/dashboard", async (req: RequestUser, res) => {
  const user: ProfileUser = await User.findOne({
    where: { id: req.user.id },
    relations: ["following", "followers", "messages"],
  });
  if (!user) return res.json({ success: false, error: "user does not exist." });

  user.messageCount = user.messages.length;
  delete user.messages;
  return res.json({ success: true, user });
});
router.get("/api/user/profile", async (req: RequestUser, res) => {
  const user: ProfileUser = await User.findOne({
    where: { username: Like(req.query.username) },
    relations: ["following", "followers", "messages"],
  });
  if (!user) return res.json({ success: false, error: "user does not exist" });
  user.messageCount = user.messages.length;
  delete user.messages;

  return res.json({ success: true, user });
});
router.get("/api/user/color", async (req: RequestUser, res) => {
  if (!req.user) return res.json({ success: true, color: "default" });
  const user: User = await User.findOne({
    where: { id: req.user.id },
    select: ["color"],
  });
  if (!user) return res.json({ success: false, error: "user does not exist." });
  return res.json({ success: true, color: user.color });
});

router.get("/api/user/followers", async (req: RequestUser, res) => {
  const user: ProfileUser = await User.findOne({
    where: { username: Like(req.query.username) },
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
    const authUser: User = await User.findOne(req.user.id);
    user.followers.map((follow: FollowUser) => {
      follow.isBeingFollowed = authUser.following
        .map((following) => following.following.id)
        .includes(follow.following.id);
    });
  }

  return res.json({ success: true, user });
});

router.get("/api/user/following", async (req: RequestUser, res) => {
  const user: ProfileUser = await User.findOne({
    where: { username: Like(req.query.username) },
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
    const authUser: User = await User.findOne({
      where: { id: req.user.id },
      relations: ["following", "following.following"],
    });
    user.following.map((follow: FollowUser) => {
      follow.isBeingFollowed = authUser.following
        .map((following) => following.following.id)
        .includes(follow.following.id);
    });
  }

  return res.json({ success: true, user });
});
router.get("/api/user/tooltip", async (req: RequestUser, res) => {
  const user_ = await User.createQueryBuilder("user")
    .where("user.username ILIKE :username", { username: req.query.username })
    .getOne();

  //.then((x) => x.username);
  if (!user_) return res.json({ error: "user doesnt exist" });
  const user: ProfileUser = await User.findOne({
    where: { username: user_.username },
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
  if (req.user) {
    const authUser: User = await User.findOne({
      where: { id: req.user.id },
      relations: ["following", "following.following"],
    });
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
  (req: RequestUser, res) => {
    if (!req.user) return res.json({ success: false, error: "no user." });
    return res.json({ success: true, user: req.user });
  },
);

router.post("/api/user/settings/", async (req: RequestUser, res) => {
  const user: User = await User.findOne(req.user.id);
  if (user.id !== req.user.id) {
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
        return res.json({ success: false, errors });
      }
      try {
        await user.save();
        return res.json({ success: true, user });
      } catch (e) {
        if (e.name === "QueryFailedError") {
          //res.redirect("/settings");
        }
      }
    },
  );
});

router.post(
  "/api/user/follow",
  passport.authenticate("jwt", { session: false }),
  async (req: RequestUser, res) => {
    if (!req.user) {
      return res.json({ success: false, error: "user does not exist." });
    }
    const userThatWillBeFollowing: User = await User.findOne(req.user.id);
    const userThatWillBeFollowed: User = await User.findOne(req.body.id);
    if (!userThatWillBeFollowed)
      return res.json({
        success: false,
        error: "user attempting to be followed does not exist.",
      });

    const follow: Follow | undefined = await Follow.findOne({
      where: {
        follower: userThatWillBeFollowing,
        following: userThatWillBeFollowed,
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
