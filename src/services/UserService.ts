import { Repository } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { User } from "../models/User";
import crypto from "crypto";

const userRepository: Repository<User> = AppDataSource.getRepository(User);

export async function createUser(data: {
  username: string;
  walletAddress: string;
}) {
  const newNonce: string = crypto.randomBytes(16).toString("hex");
  const userData: { username: string; walletAddress: string; nonce: string } = {
    ...data,
    nonce: newNonce,
  };
  const user = userRepository.create(userData);
  return userRepository.save(user);
}

export async function getUser(walletAddress: string) {
  return userRepository.findOne({
    where: { walletAddress },
    select: {
      username: true,
      walletAddress: true,
      voiceCallRate: true,
      videoCallRate: true,
      role: true,
    },
  });
}

export async function getAllUsers() {
  return userRepository.find({
    select: {
      username: true,
      walletAddress: true,
      voiceCallRate: true,
      videoCallRate: true,
      role: true,
    },
  });
}

export async function editUser(walletAddress: string, data: Partial<User>) {
  if (data.walletAddress) delete data.walletAddress;
  if (data.nonce) delete data.nonce;
  await userRepository.update({ walletAddress }, { ...data });
  return userRepository.findOne({
    where: { walletAddress },
    select: {
      username: true,
      walletAddress: true,
      voiceCallRate: true,
      videoCallRate: true,
      role: true,
    },
  });
}

export async function getAllListeners() {
  return userRepository.find({
    where: { role: "listener" },
    select: {
      username: true,
      walletAddress: true,
      voiceCallRate: true,
      videoCallRate: true,
      role: true,
    },
  });
}

export async function getAllActiveListeners() {
  return userRepository.find({
    where: { role: "listener", status: "active" },
    select: {
      username: true,
      walletAddress: true,
      voiceCallRate: true,
      videoCallRate: true,
      role: true,
    },
  });
}

export async function setUserOnline(walletAddress: string) {
  await userRepository.update({ walletAddress }, { status: "active" });
  return userRepository.findOne({
    where: { walletAddress },
    select: {
      username: true,
      walletAddress: true,
      status: true,
    },
  });
}

export async function setUserOffline(walletAddress: string) {
  await userRepository.update({ walletAddress }, { status: "inactive" });
  return userRepository.findOne({
    where: { walletAddress },
    select: {
      username: true,
      walletAddress: true,
      status: true,
    },
  });
}
