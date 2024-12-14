import { Request, Response } from "express";
import { createUser, getUser, editUser } from "../services/UserService";

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

export async function handleEditUser(req: Request, res: Response) {
  try {
    const updatedUser = await editUser(parseInt(req.params.id, 10), req.body);
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
