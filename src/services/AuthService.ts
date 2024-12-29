import { Repository } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { User } from "../models/User";
import ethUtils from "ethereumjs-util";
import { generateToken } from "../middlewares/AuthMiddleware";

const userRepository: Repository<User> = AppDataSource.getRepository(User);

export async function requestNonce(walletAddress: string) {
  const user = await userRepository.findOne({
    where: { walletAddress },
  });
  if (!user) return;
  return user.nonce;
}

export async function verifySignature(
  walletAddress: string,
  signature: string,
) {
  const user = await userRepository.findOne({ where: { walletAddress } });
  if (!user) return;

  const msg = `Nonce: ${user.nonce}`;
  const msgHex = ethUtils.bufferToHex(Buffer.from(msg));
  const msgBuffer = ethUtils.toBuffer(msgHex);
  const msgHash = ethUtils.hashPersonalMessage(msgBuffer);
  const signatureBuffer = ethUtils.toBuffer(signature);
  const { v, r, s } = ethUtils.fromRpcSig(signatureBuffer);

  const publicKey = ethUtils.ecrecover(msgHash, v, r, s);
  const addressBuffer = ethUtils.publicToAddress(publicKey);
  const recoveredAddress = ethUtils.bufferToHex(addressBuffer);

  if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) return;

  const token = generateToken({
    username: user.username,
    walletAddress: user.walletAddress,
  });

  user.nonce = Math.floor(Math.random() * 1000000).toString();
  await userRepository.save(user);
  return token;
}
