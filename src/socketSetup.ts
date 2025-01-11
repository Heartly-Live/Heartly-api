import { Server as SocketServer } from "socket.io";
import { v4 as uuidv4 } from "uuid";

export default function socketSetup(io: SocketServer) {
  let onlineUsers = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("User online on socket:", socket.id);

    socket.on("join", ({ username }) => {
      onlineUsers.set(username, socket.id);
      console.log(`Set ${username} as ${onlineUsers.get(username)}`);
    });

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

    socket.on("disconnect", () => {
      console.log("User disconnect:", socket.id);
    });
  });
}
