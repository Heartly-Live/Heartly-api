import { Request, Response } from "express";
import {
  checkUsername,
  createUser,
  getUserByWalletAddress,
  getUserByUsername,
  editUser,
  getAllUsers,
  getAllListeners,
  changeRoleToListener,
} from "../services/UserService";

export async function handleCheckUsername(req: Request, res: Response) {
  try {
    const usernameAvailable = await checkUsername(req.params.username);
    if (usernameAvailable) {
      res.status(200).json({ avaiable: usernameAvailable });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleCreateUser(req: Request, res: Response) {
  try {
    const {
      username,
      walletAddress,
      voiceCallRate,
      videoCallRate,
      languages,
      expertises,
    } = req.body;
    const newUser = await createUser({
      username,
      walletAddress,
      voiceCallRate,
      videoCallRate,
      languages,
      expertises,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleGetUserByWalletAddress(
  req: Request,
  res: Response,
) {
  try {
    const user = await getUserByWalletAddress(req.params.walletAddress);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleGetUserByUsername(req: Request, res: Response) {
  try {
    const user = await getUserByUsername(req.params.username);
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
      req.body.expertises,
      req.body.status,
    );
    if (!listeners)
      return res.status(404).json({ error: "Listerners not found" });
    res.json(listeners);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleChangeRoleToListener(req: Request, res: Response) {
  try {
    const updatedListener = await changeRoleToListener(
      req.params.walletAddress,
    );
    if (!updatedListener)
      return res.status(404).json({ error: "User not found" });
    res.json(updatedListener);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
