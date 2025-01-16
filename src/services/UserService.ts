import { Repository } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { User } from "../models/User";
import crypto from "crypto";
import { Language } from "../models/Language";

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const languageRepository: Repository<Language> =
  AppDataSource.getRepository(Language);

const userHelper = (
  user: User,
): {
  username: string;
  walletAddress: string;
  voicecallRate: number;
  videoCallRate: number;
  languages: string[];
  role: string;
} => {
  return {
    username: user.username,
    walletAddress: user.walletAddress,
    voicecallRate: user.voiceCallRate,
    videoCallRate: user.videoCallRate,
    languages: user.languages.map((language) => language.name),
    role: user.role,
  };
};

export async function createUser(data: {
  username: string;
  walletAddress: string;
  voiceCallRate?: number;
  videoCallRate?: number;
  languages?: string[];
  //specialities?: [string];
}) {
  const newNonce: string = crypto.randomBytes(16).toString("hex");
  const userData: {
    username: string;
    walletAddress: string;
    voiceCallRate?: number;
    videoCallRate?: number;
    nonce: string;
  } = {
    ...data,
    nonce: newNonce,
  };

  const languages: Language[] = [];

  if (data.languages) {
    for (const languageName of data.languages) {
      const language = await languageRepository.findOne({
        where: { name: languageName },
      });
      if (language) languages.push(language);
    }
  }

  const user = userRepository.create({ ...userData, languages });

  const savedUser = await userRepository.save(user);
  return userHelper(savedUser);
}

export async function getUserByWalletAddress(walletAddress: string) {
  const user = await userRepository.findOne({
    where: { walletAddress },
    relations: {
      languages: true,
    },
    select: {
      nonce: false,
      id: false,
      status: false,
    },
  });

  if (!user) {
    throw new Error("No user found");
  } else {
    return userHelper(user);
  }
}

export async function getUserByUsername(username: string) {
  const user = await userRepository.findOne({
    where: { username },
    relations: ["languages"],
    select: {
      nonce: false,
      id: false,
      status: false,
    },
  });

  if (!user) {
    throw new Error("No user found");
  } else {
    return userHelper(user);
  }
}

export async function getAllUsers() {
  const users = await userRepository.find({
    select: {
      nonce: false,
      id: false,
      status: false,
    },
  });

  const data = [];

  if (!users) {
    throw new Error("Users not found");
  } else {
    for (const user of users) {
      data.push(userHelper(user));
    }
  }

  return data;
}

export async function editUser(
  walletAddress: string,
  data: {
    username?: string;
    voiceCallRate?: number;
    videoCallRate?: number;
    languages?: string[];
  },
) {
  const user = await userRepository.findOne({ where: { walletAddress } });
  const languages: Language[] = [];

  if (user && data.languages) {
    for (const languageName of data.languages) {
      const language = await languageRepository.findOne({
        where: { name: languageName },
      });
      if (language) languages.push(language);
    }
    delete data.languages;
  }
  await userRepository.update({ walletAddress }, { ...data, languages });
  const savedUser = await userRepository.findOne({
    where: { walletAddress },
    select: {
      nonce: false,
      id: false,
      status: false,
    },
  });
  if (!savedUser) {
    throw new Error("Could not update user");
  }
  return userHelper(savedUser);
}

export async function getAllListeners(
  languages: string[] = [],
  //specialities?: string[],
  status?: string,
) {
  const query = userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.languages", "language");

  if (languages.length > 0) {
    query.andWhere("language.name IN (...languages)", { languages });
  }

  query.andWhere("user.role LIKE 'listener'");

  if (status === "active") {
    query.andWhere("user.status like 'active'");
  }
  return query.getMany();
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
