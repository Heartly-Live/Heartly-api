import { Repository } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { User } from "../models/User";
import bcrypt from "bcrypt";

const userRepository: Repository<User> = AppDataSource.getRepository(User);

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = userRepository.create({ ...data, password: hashedPassword });
  return userRepository.save(user);
}

export async function getUser(id: number) {
  return userRepository.findOneBy({ id });
}

export async function getAllUsers() {
  return userRepository.find();
}

export async function getUserByEmail(email: string) {
  return userRepository.findOneBy({ email });
}

export async function editUser(id: number, data: Partial<User>) {
  if (data.password) delete data.password;
  if (data.email) delete data.email;
  await userRepository.update(id, data);
  return userRepository.findOneBy({ id });
}
