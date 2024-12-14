import { Repository } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { User } from "../models/User";

const userRepository: Repository<User> = AppDataSource.getRepository(User);

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
}) {
  const user = userRepository.create(data);
  return userRepository.save(user);
}

export async function getUser(id: number) {
  return userRepository.findOneBy({ id });
}

export async function editUser(id: number, data: Partial<User>) {
  await userRepository.update(id, data);
  return userRepository.findOneBy({ id });
}
