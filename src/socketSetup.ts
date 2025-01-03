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

    socket.on("request-call", ({ username }) => {
      console.log(`Call request for ${username}`);
      if (onlineUsers.has(username)) {
        const roomId = uuidv4();
        console.log(`${socket.id} joined ${roomId}`);
        socket.join(roomId);
        socket
          .to(onlineUsers.get(username) || "")
          .emit("request-call", { roomId });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnect:", socket.id);
    });
  });
}
