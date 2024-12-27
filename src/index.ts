import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userRouter from "./routers/UserRouter";
import { AppDataSource } from "./db/AppDataSource";
import { createServer, Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { ExpressPeerServer } from "peer";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const server: HTTPServer = createServer(app);
const io: SocketServer = new SocketServer(server);
const peerServer = ExpressPeerServer(server);

app.use(express.json());
app.use("/api", userRouter);
app.use("/peerjs", peerServer);

app.get("/", (req: Request, res: Response) => {
  res.send("Server up on root!");
});

io.on("connection", () => {
  console.log("A User Connected");
});

AppDataSource.initialize()
  .then(() => {
    server.listen(port, () => console.log(`Server up and running on ${port}`));
  })
  .catch((error) => console.log("Error initializing datasource:", error));
