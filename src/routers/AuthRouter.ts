import express from "express";
import {
  handleRefreshToken,
  handleRequestNonce,
  handleVerifySignature,
} from "../controllers/AuthController";
import { authenticateToken } from "../middlewares/AuthMiddleware";

const authRouter = express.Router();

authRouter.post("/request-nonce", handleRequestNonce);
authRouter.post("/verify-signature", handleVerifySignature);
authRouter.get("/refresh-token", authenticateToken, handleRefreshToken);

export default authRouter;
