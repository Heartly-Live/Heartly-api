import { Repository } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { User } from "../models/User";

const userRepository: Repository<User> = AppDataSource.getRepository(User);

export async function createUser(data: {
  username: string;
  walletAddress: string;
}) {
  const user = userRepository.create({ ...data });
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
  await userRepository.update(id, data);
  return userRepository.findOneBy({ id });
}
