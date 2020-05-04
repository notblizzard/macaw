import { Router, Request } from "express";
import { User } from "../models";
import { Like as TypeORMLike } from "typeorm";
import passport from "passport";
import Conversation from "../models/Conversation";

const router = Router();

interface RequestUser extends Request {
  id: number;
}
router.get(
  "/api/conversation/conversations",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user: User | undefined = await User.findOne({
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

/*router.post(
  "/api/conversation/new-conversation-message",
  passport.authenticate("jwt", { session: false }),
  async (req: RequestUser, res) => {
    const user = await User.findOne({
      where: { id: req.user.id },
      relations: ["conversations", "conversationMessages"],
    });
    const conversation = await Conversation.findOne({
      where: { id: req.body.id },
      relations: ["messages"],
    });
    if (!conversation)
      return res.json({ success: false, error: "conversation doesn't exist." });
    const conversationMessage = new ConversationMessage();
    conversationMessage.user = user;
    conversationMessage.data = req.body.data;
    conversationMessage.conversation = conversation;
    await conversationMessage.save();
    return res.json({ success: true });
  },
);*/

router.post("/api/conversation/new-conversation", async (req, res) => {
  const user = await User.findOne({
    where: { id: (req.user as RequestUser).id },
    relations: ["conversations", "conversationMessages"],
  });
  const userSendingTo: User | undefined = await User.findOne({
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
    const conversation = new Conversation();
    conversation.users = [];
    conversation.users.push(user as User, userSendingTo);
    await conversation.save();
    user?.conversations.push(conversation);
    userSendingTo.conversations.push(conversation);
    await user?.save();
    await userSendingTo.save();
    return res.json({ success: true });
  } else {
    return res.json({ success: false, error: "conversation already exists" });
  }
});

export default router;
