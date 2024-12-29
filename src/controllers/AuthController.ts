import { Request, Response } from "express";
import { requestNonce, verifySignature } from "../services/AuthService";

export async function handleRequestNonce(req: Request, res: Response) {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress)
      return res.status(400).json({ error: "Wallet address is required" });
    const nonce = await requestNonce(walletAddress);
    if (!nonce) return res.status(400).json({ error: "User not found" });
    console.log("Sent nonce", nonce);
    res.json({ nonce: nonce });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function handleVerifySignature(req: Request, res: Response) {
  try {
    const { walletAddress, message, signature } = req.body;
    if (!walletAddress || !signature || !message)
      return res
        .status(400)
        .json({ error: "WalletAddress, message and signature are required" });
    const jwtToken = await verifySignature(walletAddress, message, signature);
    if (!jwtToken)
      return res.status(401).json({ error: "Signature Verification failed" });
    res.json({ token: jwtToken });
    console.log("Token sent by controller", jwtToken);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
}
