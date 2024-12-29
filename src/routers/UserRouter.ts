import express from "express";
import {
  handleCreateUser,
  handleGetUser,
  handleEditUser,
  handleGetAllUsers,
} from "../controllers/UserController";

const userRouter = express.Router();

userRouter.post("/", handleCreateUser);
userRouter.get("/id/:id", handleGetUser);
userRouter.get("/all", handleGetAllUsers);
userRouter.put("/:id", handleEditUser);

export default userRouter;
