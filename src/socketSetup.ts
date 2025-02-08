import { Server as SocketServer } from "socket.io";
import ExtendedSocket from "./interfaces/ExtendedSocket";
import { v4 as uuidv4 } from "uuid";
import { setUserOnline, setUserOffline } from "./services/UserService";

export default function socketSetup(io: SocketServer) {
  let onlineUsers = new Map<string, string>();

  io.on("connection", async (socket: ExtendedSocket) => {
    if (socket.user?.walletAddress) {
      onlineUsers.set(socket.user.walletAddress, socket.id);
      await setUserOnline(socket.user.walletAddress);
      console.log(
        `Set ${socket.user.walletAddress} as ${onlineUsers.get(socket.user.walletAddress)}`,
      );
    } else {
      console.log("Couldnt add user, closed socket");
      socket.disconnect();
    }
    console.log(`${socket.id} joined`);

    socket.on("call-accepted", async ({ caller, roomId, peerId }) => {
      console.log(`Call accepted by ${socket.user?.walletAddress}`);
      const username = socket.user?.walletAddress;
      socket.join(roomId);
      socket.to(roomId).emit("call-accepted", { username, peerId });
    });

    socket.on("call-denied", async ({ caller, roomId }) => {
      console.log(`Call denied by ${socket.user?.walletAddress}`);
      const username = socket.user?.walletAddress;
      socket.to(roomId).emit("call-denied", { username });
      await io.sockets.sockets
        .get(onlineUsers.get(caller) || "")
        ?.leave(roomId);
    });

    socket.on("request-call", ({ reciever }) => {
      console.log(
        `Call request for ${reciever} from ${socket.user?.walletAddress}`,
      );
      if (
        onlineUsers.has(reciever) //&&
        //reciever !== socket.user?.walletAddress
      ) {
        const roomId = uuidv4();
        console.log(`${socket.id} joined ${roomId}`);
        socket.join(roomId);
        socket
          .to(onlineUsers.get(reciever) || "")
          .emit("call-request", { caller: socket.user?.walletAddress, roomId });
      } else {
        console.log("Cant find requested user to call");
        socket.emit("User-not-found");
      }
    });

    socket.on("disconnect", async () => {
      if (socket.user?.username && socket.user?.walletAddress) {
        onlineUsers.delete(socket.user?.walletAddress || "");
        await setUserOffline(socket.user?.walletAddress);
        console.log("User disconnect:", socket.id);
      }
    });
  });
}
