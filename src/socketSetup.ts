import { Server as SocketServer } from "socket.io";
import ExtendedSocket from "./interfaces/ExtendedSocket";
import { v4 as uuidv4 } from "uuid";
import { setUserOnline, setUserOffline } from "./services/UserService";

export default function socketSetup(io: SocketServer) {
  const onlineUsers: Record<string, string> = {};

  io.on("connection", async (socket: ExtendedSocket) => {
    if (socket.user?.walletAddress) {
      const walletAddress = socket.user.walletAddress.toLowerCase();
      onlineUsers[walletAddress] = socket.id;
      await setUserOnline(walletAddress);
      console.log(`Set ${walletAddress} as ${onlineUsers[walletAddress]}`);
    } else {
      console.log("Couldn't add user, closed socket");
      socket.disconnect();
      return;
    }

    console.log(`${socket.id} joined`);

    socket.on("call-accepted", async ({ caller, roomId, peerId }) => {
      const username = socket.user?.walletAddress?.toLowerCase();
      console.log(`Call accepted by ${username}`);
      socket.join(roomId);
      socket.to(roomId).emit("call-accepted", { username, peerId });
    });

    socket.on("call-denied", async ({ caller, roomId }) => {
      const username = socket.user?.walletAddress?.toLowerCase();
      console.log(`Call denied by ${username}`);
      socket.to(roomId).emit("call-denied", { username });

      const callerSocketId = onlineUsers[caller.toLowerCase()];
      if (callerSocketId) {
        const callerSocket = io.sockets.sockets.get(callerSocketId);
        if (callerSocket) {
          await callerSocket.leave(roomId);
        }
      }
    });

    socket.on("request-call", ({ reciever }) => {
      if (!socket.user?.walletAddress) {
        socket.emit("error", "Not authenticated");
        return;
      }

      const normalizedReciever = reciever.toLowerCase();
      const normalizedCaller = socket.user.walletAddress.toLowerCase();

      console.log(
        `Call request for ${normalizedReciever} from ${normalizedCaller}`,
      );
      console.log("All users online:", onlineUsers);
      console.log("Is online?", normalizedReciever in onlineUsers);

      if (
        normalizedReciever in onlineUsers &&
        normalizedReciever !== normalizedCaller
      ) {
        const roomId = uuidv4();
        console.log(`${socket.id} joined ${roomId}`);
        socket.join(roomId);

        const receiverSocketId = onlineUsers[normalizedReciever];
        socket.to(receiverSocketId).emit("call-request", {
          caller: normalizedCaller,
          roomId,
        });
      } else {
        console.log("Can't find requested user to call");
        socket.emit("User-not-found");
      }
    });

    socket.on("disconnect", async () => {
      if (socket.user?.walletAddress) {
        const walletAddress = socket.user.walletAddress.toLowerCase();
        delete onlineUsers[walletAddress];
        await setUserOffline(walletAddress);
        console.log("User disconnected:", socket.id);
      }
    });
  });

  return {
    isUserOnline: (walletAddress: string) =>
      walletAddress.toLowerCase() in onlineUsers,
    getOnlineUsers: () => ({ ...onlineUsers }),
  };
}
