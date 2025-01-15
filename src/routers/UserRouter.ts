import express from "express";
import {
  handleCreateUser,
  handleGetUser,
  handleEditUser,
  handleGetAllUsers,
  handleGetAllListeners,
} from "../controllers/UserController";
import { authenticateToken } from "../middlewares/AuthMiddleware";

const userRouter = express.Router();

userRouter.post("/", handleCreateUser);
userRouter.get("/wallet/:walletAddress", authenticateToken, handleGetUser);
userRouter.get("/all", authenticateToken, handleGetAllUsers);
userRouter.put("/:walletAddress", authenticateToken, handleEditUser);
userRouter.get("/listener", authenticateToken, handleGetAllListeners);

export default userRouter;
