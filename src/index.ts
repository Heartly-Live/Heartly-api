import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userRouter from "./routers/UserRouter";
import authRouter from "./routers/AuthRouter";
import { AppDataSource } from "./db/AppDataSource";
import { createServer, Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { ExpressPeerServer } from "peer";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken } from "./middlewares/AuthMiddleware";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const server: HTTPServer = createServer(app);
const io: SocketServer = new SocketServer(server);
const peerServer = ExpressPeerServer(server);

app.use("/auth", express.json(), authRouter);
app.use("/users", express.json(), authenticateToken, userRouter);
app.use("/peerjs", authenticateToken, peerServer);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

AppDataSource.initialize()
  .then(() => {
    server.listen(port, () => console.log(`Server up and running on ${port}`));
  })
  .catch((error) => console.log("Error initializing datasource:", error));
