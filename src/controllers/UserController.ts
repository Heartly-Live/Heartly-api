import { Request, Response } from "express";
import {
  createUser,
  getUser,
  editUser,
  getAllUsers,
  getAllListeners,
} from "../services/UserService";

export async function handleCreateUser(req: Request, res: Response) {
  try {
    const { username, walletAddress, voiceCallRate, videoCallRate, languages } =
      req.body;
    const newUser = await createUser({
      username,
      walletAddress,
      voiceCallRate,
      videoCallRate,
      languages,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleGetUser(req: Request, res: Response) {
  try {
    const user = await getUser(req.params.walletAddress);
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
    const updatedUser = await editUser(req.params.walletAddress, req.body);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleGetAllListeners(req: Request, res: Response) {
  try {
    const listeners = await getAllListeners(
      req.body.languages,
      req.body.status,
    );
    if (!listeners)
      return res.status(404).json({ error: "Listerners not found" });
    res.json(listeners);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
