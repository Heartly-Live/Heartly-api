import { Server as SocketServer } from "socket.io";
import ExtendedSocket from "./interfaces/ExtendedSocket";
import { v4 as uuidv4 } from "uuid";
import { setUserOnline, setUserOffline } from "./services/UserService";

export default function socketSetup(io: SocketServer) {
  // Using a plain object to store online users
  const onlineUsers: Record<string, string> = {};

  io.on("connection", async (socket: ExtendedSocket) => {
    if (socket.user?.walletAddress) {
      onlineUsers[socket.user.walletAddress] = socket.id;
      await setUserOnline(socket.user.walletAddress);
      console.log(
        `Set ${socket.user.walletAddress} as ${onlineUsers[socket.user.walletAddress]}`,
      );
    } else {
      console.log("Couldn't add user, closed socket");
      socket.disconnect();
      return;
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

      // Get caller's socket and make them leave the room
      const callerSocketId = onlineUsers[caller];
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

      console.log(
        `Call request for ${reciever} from ${socket.user.walletAddress}`,
      );
      console.log("All users online:", onlineUsers);
      console.log("Is online?", reciever in onlineUsers);

      // Check if receiver exists and is not the caller
      if (reciever in onlineUsers && reciever !== socket.user.walletAddress) {
        const roomId = uuidv4();
        console.log(`${socket.id} joined ${roomId}`);
        socket.join(roomId);

        const receiverSocketId = onlineUsers[reciever];
        socket.to(receiverSocketId).emit("call-request", {
          caller: socket.user.walletAddress,
          roomId,
        });
      } else {
        console.log("Can't find requested user to call");
        socket.emit("User-not-found");
      }
    });

    socket.on("disconnect", async () => {
      if (socket.user?.walletAddress) {
        delete onlineUsers[socket.user.walletAddress];
        await setUserOffline(socket.user.walletAddress);
        console.log("User disconnected:", socket.id);
      }
    });
  });

  /*
  // Optional: Add an interval to clean up stale connections
  setInterval(() => {
    for (const [walletAddress, socketId] of Object.entries(onlineUsers)) {
      if (!io.sockets.sockets.has(socketId)) {
        delete onlineUsers[walletAddress];
        setUserOffline(walletAddress).catch(console.error);
        console.log(`Cleaned up stale connection for ${walletAddress}`);
      }
    }
  }, 60000); // Run every minute
*/
  return {
    // Expose methods to check online status if needed
    isUserOnline: (walletAddress: string) => walletAddress in onlineUsers,
    getOnlineUsers: () => ({ ...onlineUsers }),
  };
}
