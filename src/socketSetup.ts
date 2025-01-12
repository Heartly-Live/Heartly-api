import { Server as SocketServer } from "socket.io";
import ExtendedSocket from "./interfaces/ExtendedSocket";
import { v4 as uuidv4 } from "uuid";
import { setUserOnline, setUserOffline } from "./services/UserService";

export default function socketSetup(io: SocketServer) {
  let onlineUsers = new Map<string, string>();

  io.on("connection", async (socket: ExtendedSocket) => {
    if (socket.user?.username && socket.user?.walletAddress) {
      onlineUsers.set(socket.user.username, socket.id);
      await setUserOnline(socket.user.walletAddress);
      console.log(
        `Set ${socket.user.username} as ${onlineUsers.get(socket.user.username)}`,
      );
    } else {
      socket.disconnect();
    }

    socket.on("call-accepted", async ({ username, caller, roomId, peerId }) => {
      console.log(`Call accepted by ${username}`);
      socket.join(roomId);
      socket.to(roomId).emit("call-accepted", { username, peerId });
    });

    socket.on("call-denied", async ({ username, caller, roomId }) => {
      console.log(`Call denied by ${username}`);
      socket.to(roomId).emit("call-denied", { username });
      await io.sockets.sockets
        .get(onlineUsers.get(caller) || "")
        ?.leave(roomId);
    });

    socket.on("request-call", ({ reciever, username }) => {
      console.log(`Call request for ${reciever} from ${username}`);
      if (onlineUsers.has(reciever)) {
        const roomId = uuidv4();
        console.log(`${socket.id} joined ${roomId}`);
        socket.join(roomId);
        socket
          .to(onlineUsers.get(reciever) || "")
          .emit("call-request", { caller: username, roomId });
      } else {
        console.log("Cant find requested user to call");
        socket.emit("User-not-found");
      }
    });

    socket.on("disconnect", async () => {
      if (socket.user?.username && socket.user?.walletAddress) {
        onlineUsers.delete(socket.user?.username || "");
        await setUserOffline(socket.user?.walletAddress);
        console.log("User disconnect:", socket.id);
      }
    });
  });
}
