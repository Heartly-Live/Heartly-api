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

userRouter.post("/users/register", handleRegister);
userRouter.post("/users/login", handleLogin);
userRouter.post("/users", authenticateToken, handleCreateUser);
userRouter.get("/users/id/:id", authenticateToken, handleGetUser);
userRouter.get("/users/all", authenticateToken, handleGetAllUsers);
userRouter.get("/users/email/:email", authenticateToken, handleGetUserByEmail);
userRouter.put("/users/:id", authenticateToken, handleEditUser);

export default userRouter;
