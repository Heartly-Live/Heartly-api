import express from "express";
import {
  handleCheckUsername,
  handleCreateUser,
  handleGetUserByWalletAddress,
  handleGetUserByUsername,
  handleEditUser,
  handleGetAllUsers,
  handleGetAllListeners,
} from "../controllers/UserController";
import { authenticateToken } from "../middlewares/AuthMiddleware";

const userRouter = express.Router();

userRouter.get("/check-username/:username", handleCheckUsername);
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
userRouter.get("/all", handleGetAllUsers);
userRouter.put("/:walletAddress", authenticateToken, handleEditUser);
userRouter.get("/listener", handleGetAllListeners);

export default userRouter;
