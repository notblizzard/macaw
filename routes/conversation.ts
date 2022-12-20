import { Router, Request } from "express";
import { User } from "../models";
import { Like as TypeORMLike } from "typeorm";
import passport from "passport";
import Conversation from "../models/Conversation";
interface RequestUser extends Request {
  id: number;
}

const router = Router();

router.get(
  "/api/conversation/conversations",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user: User | null = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: [
        "conversations",
        "conversations.users",
        "conversations.messages",
        "conversations.messages.user",
      ],
    });
    if (!user) return res.json({ success: false, error: "no user" });
    return res.json({ success: true, user });
  },
);

router.post(
  "/api/conversation/new-conversation",
  passport.authenticate("jwt"),
  async (req, res) => {
    const user = await User.findOne({
      where: { id: (req.user as RequestUser).id },
      relations: ["conversations", "conversationMessages"],
    });
    const userSendingTo: User | null = await User.findOne({
      where: { username: TypeORMLike(req.body.username) },
      relations: ["conversations", "conversationMessages"],
    });
    if (!userSendingTo) {
      return res.json({
        success: false,
        error: "user you're sending to doesnt exist",
      });
    }

    const overlap = user?.conversations.filter((x) => {
      userSendingTo.conversations.filter((y) => {
        return x.id === y.id;
      });
    });

    if (overlap?.length === 0) {
      let conversation = new Conversation();
      conversation.users = [];
      conversation.users.push(user as User, userSendingTo);
      await conversation.save();
      user?.conversations.push(conversation);
      userSendingTo.conversations.push(conversation);
      await user?.save();
      await userSendingTo.save();
      conversation = (await Conversation.findOne({
        where: { id: conversation.id },
        relations: ["users", "messages"],
      })) as Conversation;
      return res.json({ success: true, conversation });
    } else {
      return res.json({ success: false, error: "conversation already exists" });
    }
  },
);

export default router;
