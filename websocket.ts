import { User, Message } from "./models/";
import ConversationMessage from "./models/ConversationMessage";
import Conversation from "./models/Conversation";
import { Socket, Server } from "socket.io";
import uploader from "./uploader";

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
    socket.on("authorize", (data) => {
      socket.userId = data.id;
    });

    socket.on("new message", async (data) => {
      console.log(data);
      console.log(`socket is ${socket.userId}`);
      const user: User | undefined = await User.findOne(
        socket.userId as number,
      );
      if (!user) return false;
      const message: Message | undefined = await Message.findOne({
        where: { id: data.id },
        relations: ["user"],
      });
      if (!message) return false;

      // only emit to user if they're on a page they control
      if (
        data.path === "/dashboard" ||
        data.path.toLowerCase() === `/@${user.username.toLowerCase}`
      ) {
        socket.emit("new message", message);
      }
    });
    socket.on("new private message", async (data) => {
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
      socket.emit("new private message", conversationMessage);
      const otherUser = await getUser(otherUserId);
      otherUser.emit("new private message", conversationMessage);
    });

    socket.on("delete message", async (data) => {
      const message: Message | undefined = await Message.findOne({
        where: { id: data.id },
        relations: ["user"],
      });
      if (!message) return false;
      if (message.userId !== socket.userId) return false;
      await message.remove();
      if (
        data.path === "/dashboard" ||
        data.path.toLowerCase() === `/@${message.user.username.toLowerCase}`
      ) {
        socket.emit("delete message", { id: data.id });
      }
    });

    socket.on("disconnecting", (reason) => {
      socket.userId = undefined;
    });
  });
};
