import { Socket } from "socket.io";
import { User } from "../models/User";

export default interface ExtendedSocket extends Socket {
  user?: Partial<User>;
}
