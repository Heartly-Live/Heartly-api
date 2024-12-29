import express, { Express } from "express";
import dotenv from "dotenv";
import userRouter from "./routers/UserRouter";
import authRouter from "./routers/AuthRouter";
import { AppDataSource } from "./db/AppDataSource";
import { createServer, Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { ExpressPeerServer } from "peer";
import * as path from "path";
import { authenticateToken } from "./middlewares/AuthMiddleware";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const server: HTTPServer = createServer(app);
const io: SocketServer = new SocketServer(server);
const peerServer = ExpressPeerServer(server);

app.use("/auth", express.json(), authRouter);
app.use("/users", express.json(), userRouter);
app.use("/peerjs", authenticateToken, peerServer);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

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

AppDataSource.initialize()
  .then(() => {
    server.listen(port, () => console.log(`Server up and running on ${port}`));
  })
  .catch((error) => console.log("Error initializing datasource:", error));
