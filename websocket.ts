import { User, Message } from "./models/";
import ConversationMessage from "./models/ConversationMessage";
import Conversation from "./models/Conversation";
import { Socket, Server } from "socket.io";

interface UserSocket extends Socket {
  userId: number | undefined;
  username: string;
  path: string;
}

interface NewMessage {
  id: number;
  conversationId: number;
}

interface NewPrivateMessage {
  data: string;
  conversationId: number;
}

interface DeleteMessage {
  id: number;
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

  const getUsersInPath = (
    socket: UserSocket,
    followers: number[],
  ): Promise<UserSocket[]> => {
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
            users.push(user);
          }
          // update messages if the user is following the `socket`,
          // and is on their dashboard
          if (
            user.path?.toLowerCase() === "/dashboard" &&
            followers.includes(user.userId!)
          ) {
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

    socket.on("path", (path: string) => {
      socket.path = path;
      console.log("new path: " + socket.path);
    });

    socket.on("new message", async (data: NewMessage) => {
      const user: User | null = await User.findOne({
        where: { id: socket.userId as number },
        relations: ["followers", "followers.follower"],
      });
      if (!user) return false;
      const message: Message | null = await Message.findOne({
        where: { id: data.id },
        relations: ["user"],
      });
      if (!message) return false;
      const followerUserIds = user.followers.map(
        (follow) => follow.follower.id,
      );
      const users = await getUsersInPath(socket, followerUserIds);
      if (socket.path === "/dashboard") {
        socket.emit("new message", message);
      }
      users.forEach((user) => user.emit("new message", message));
    });

    socket.on("new private message", async (data: NewPrivateMessage) => {
      const user: User | null = await User.findOne({
        where: { id: socket.userId },
      });

      if (!user) return false;
      const conversation: Conversation | null = await Conversation.findOne({
        where: { id: data.conversationId },
        relations: ["users"],
      });
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

    socket.on("delete message", async (data: DeleteMessage) => {
      const message: Message | null = await Message.findOne({
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

    socket.on("disconnecting", (_reason) => {
      socket.userId = undefined;
    });
  });
};
