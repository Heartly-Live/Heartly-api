import express from "express";
import {
  handleCreateUser,
  handleGetUser,
  handleEditUser,
} from "../controllers/UserController";

const userRouter = express.Router();

userRouter.post("/users", handleCreateUser);
userRouter.get("/users/:id", handleGetUser);
userRouter.put("/users/:id", handleEditUser);

export default userRouter;
