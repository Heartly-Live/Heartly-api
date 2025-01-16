import express from "express";
import {
  handleCreateUser,
  handleGetUserByWalletAddress,
  handleGetUserByUsername,
  handleEditUser,
  handleGetAllUsers,
  handleGetAllListeners,
} from "../controllers/UserController";
import { authenticateToken } from "../middlewares/AuthMiddleware";

const userRouter = express.Router();

userRouter.post("/", handleCreateUser);
userRouter.get(
  "/wallet/:walletAddress",
  authenticateToken,
  handleGetUserByWalletAddress,
);
userRouter.get(
  "/username/:username",
  authenticateToken,
  handleGetUserByUsername,
);
userRouter.get("/all", authenticateToken, handleGetAllUsers);
userRouter.put("/:walletAddress", authenticateToken, handleEditUser);
userRouter.get("/listener", authenticateToken, handleGetAllListeners);

export default userRouter;
