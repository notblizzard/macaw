import { User, Message } from "./models/";
import ConversationMessage from "./models/ConversationMessage";
import Conversation from "./models/Conversation";
import { Socket, Server } from "socket.io";
import uploader from "./uploader";

interface UserSocket extends Socket {
  userId: number | undefined;
  username: string;
  path: string;
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

  const getUsersInPath = (socket: UserSocket): Promise<UserSocket[]> => {
    let path = socket.path;
    if (socket.path === "/dashboard") {
      path = `/@${socket.username}`.toLowerCase();
    }
    return new Promise((resolve) => {
      const users: UserSocket[] = [];
      io.clients(async (err: Error, clients: string[]) => {
        clients.forEach((client) => {
          const user = io.sockets.connected[client] as UserSocket;
          if (path === user.path?.toLowerCase()) {
            console.log("found 1");
            users.push(user);
          }
        });
        return resolve(users);
      });
    });
  };
  io.on("connection", (socket: UserSocket) => {
    socket.on("authenticate", (data) => {
      socket.userId = data.id;
      socket.username = data.username;
    });

    socket.on("path", (path) => {
      socket.path = path;
      console.log("new path: " + socket.path);
    });

    socket.on("new message", async (data) => {
      const user: User | undefined = await User.findOne(
        socket.userId as number,
      );
      if (!user) return false;
      const message: Message | undefined = await Message.findOne({
        where: { id: data.id },
        relations: ["user"],
      });
      if (!message) return false;

      const users = await getUsersInPath(socket);
      if (socket.path === "/dashboard") {
        socket.emit("new message", message);
      }
      users.forEach((user) => user.emit("new message", message));
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
