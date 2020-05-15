import { User } from "./models/";
import ConversationMessage from "./models/ConversationMessage";
import Conversation from "./models/Conversation";
import { Socket, Server } from "socket.io";

interface UserSocket extends Socket {
  userId: number | undefined;
}
export default (io: Server): void => {
  const getUser = (otherUserId: number): Promise<UserSocket> => {
    return new Promise((resolve) => {
      io.clients(async (err: Error, clients: string[]) => {
        clients.forEach((client) => {
          const user = io.sockets.connected[client] as UserSocket;
          if (user.userId === otherUserId) {
            return resolve(user);
          }
        });
      });
    });
  };
  io.on("connection", (socket: UserSocket) => {
    socket.on("authorized", (data) => {
      socket.userId = data.id;
    });
    socket.on("new message", async (data) => {
      const user: User | undefined = await User.findOne(socket.userId);

      if (!user) return false;
      const conversation: Conversation | undefined = await Conversation.findOne(
        {
          where: { id: data.conversationId },
          relations: ["users"],
        },
      );
      if (!conversation) return false;
      const otherUserId = conversation?.users.filter(
        (user) => user.id !== socket.userId,
      )[0].id;
      if (!conversation) return false;
      const conversationMessage = new ConversationMessage();
      conversationMessage.user = user;
      conversationMessage.data = data.data;
      conversationMessage.conversation = conversation;
      await conversationMessage.save();
      socket.emit("new message", conversationMessage);
      const otherUser = await getUser(otherUserId);
      otherUser.emit("new message", conversationMessage);
    });

    socket.on("disconnecting", (reason) => {
      socket.userId = undefined;
    });
  });
};
