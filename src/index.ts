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

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const server: HTTPServer = createServer(app);
const io: SocketServer = new SocketServer(server, {
  cors: { origin: "http://localhost:5173" },
});
const peerServer = ExpressPeerServer(server);

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/peerjs", peerServer);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = authenticateSocketToken(token);
  if (!user) next(new Error("Invalid authentication token"));
  next();
});

socketSetup(io);

AppDataSource.initialize()
  .then(() => {
    server.listen(port, () => console.log(`Server up and running on ${port}`));
  })
  .catch((error) => console.log("Error initializing datasource:", error));
