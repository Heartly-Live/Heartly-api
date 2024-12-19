import { Request, Response } from "express";
import {
  createUser,
  getUser,
  editUser,
  getAllUsers,
  getUserByEmail,
} from "../services/UserService";
import { generateToken } from "../middlewares/AuthMiddleware";
import bcrypt from "bcrypt";

export async function handleCreateUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;
    const newUser = await createUser({ username, email, password });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleGetUser(req: Request, res: Response) {
  try {
    const user = await getUser(parseInt(req.params.id, 10));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleGetUserByEmail(req: Request, res: Response) {
  try {
    const user = await getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleGetAllUsers(req: Request, res: Response) {
  try {
    const users = await getAllUsers();
    if (!users) return res.status(404).json({ error: "Users not found" });
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleEditUser(req: Request, res: Response) {
  try {
    const updatedUser = await editUser(parseInt(req.params.id, 10), req.body);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleRegister(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;
    const newUser = await createUser({ username, email, password });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = generateToken({ id: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
