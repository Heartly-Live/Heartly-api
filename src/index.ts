import express, { Express } from "express";
import dotenv from "dotenv";
import userRouter from "./routers/UserRouter";
import authRouter from "./routers/AuthRouter";
import { AppDataSource } from "./db/AppDataSource";
import { createServer, Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { ExpressPeerServer } from "peer";
import cors from "cors";
import socketSetup from "./socketSetup";
import { authenticateSocketToken } from "./middlewares/AuthMiddleware";
import ExtendedSocket from "./interfaces/ExtendedSocket";

dotenv.config();

const app: Express = express();
const httpPort = parseInt(process.env.PORT || "8000");
const socketPort = parseInt(process.env.PORT || "8001");
const server: HTTPServer = createServer(app);
const io: SocketServer = new SocketServer(socketPort, {
  path: "/socket/",
  cors: { origin: ["http://localhost:5173", "https://localhost:3000"] },
});
const peerServer = ExpressPeerServer(server, {
  path: "/peer",
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the heartly api" });
});

io.use((socket: ExtendedSocket, next) => {
  const token = socket.handshake.auth.token;
  const authenticatedUser = authenticateSocketToken(token);
  if (!authenticatedUser) {
    console.log("Couldnt authenticate socket");
    next(new Error("Invalid authentication token"));
  } else {
    console.log("Authenticated");
    socket.user = authenticatedUser;
  }
  next();
});
socketSetup(io);

AppDataSource.initialize()
  .then(() => {
    server.listen(httpPort, () =>
      console.log(`Server up and running on ${httpPort}`),
    );
  })
  .catch((error) => console.log("Error initializing datasource:", error));
