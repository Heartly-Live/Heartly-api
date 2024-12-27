import express from "express";
import {
  handleCreateUser,
  handleGetUser,
  handleEditUser,
  handleGetAllUsers,
  handleGetUserByEmail,
  handleRegister,
  handleLogin,
} from "../controllers/UserController";
import { authenticateToken } from "../middlewares/AuthMiddleware";

const userRouter = express.Router();

userRouter.post("/register", handleRegister);
userRouter.post("/login", handleLogin);
userRouter.post("/", authenticateToken, handleCreateUser);
userRouter.get("/id/:id", authenticateToken, handleGetUser);
userRouter.get("/all", authenticateToken, handleGetAllUsers);
userRouter.get("/email/:email", authenticateToken, handleGetUserByEmail);
userRouter.put("/:id", authenticateToken, handleEditUser);

export default userRouter;
