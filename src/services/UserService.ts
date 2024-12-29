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

export async function getUser(id: string) {
  return userRepository.findOneBy({ id });
}

export async function getAllUsers() {
  return userRepository.find();
}

export async function editUser(id: string, data: Partial<User>) {
  if (data.walletAddress) delete data.walletAddress;
  if (data.nonce) delete data.nonce;
  await userRepository.update(id, data);
  return userRepository.findOneBy({ id });
}
