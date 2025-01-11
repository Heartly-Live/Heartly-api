import express from "express";
import {
  handleCreateUser,
  handleGetUser,
  handleEditUser,
  handleGetAllUsers,
  handleGetAllListeners,
  handleGetAllActiveListeners,
} from "../controllers/UserController";
import { authenticateToken } from "../middlewares/AuthMiddleware";

const userRouter = express.Router();

userRouter.post("/", handleCreateUser);
userRouter.get("/wallet/:walletAddress", authenticateToken, handleGetUser);
userRouter.get("/all", authenticateToken, handleGetAllUsers);
userRouter.put("/:walletAddress", authenticateToken, handleEditUser);
userRouter.put("/listerner", authenticateToken, handleGetAllListeners);
userRouter.put(
  "/listerner/active",
  authenticateToken,
  handleGetAllActiveListeners,
);

export default userRouter;
