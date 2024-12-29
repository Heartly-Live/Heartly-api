import express from "express";
import {
  handleRequestNonce,
  handleVerifySignature,
} from "../controllers/AuthController";

const authRouter = express.Router();

authRouter.post("/request-nonce", handleRequestNonce);
authRouter.post("/verify-signature", handleVerifySignature);

export default authRouter;
