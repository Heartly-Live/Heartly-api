import { Repository } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { User } from "../models/User";
import crypto from "crypto";
import { UserLanguage } from "../models/UserLanguage";
import { Language } from "../models/Language";

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const userLanguageRepository: Repository<UserLanguage> =
  AppDataSource.getRepository(UserLanguage);
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
    languages: user.userLanguages.map((ul) => ul.language.name),
    role: user.role,
  };
};

export async function createUser(data: {
  username: string;
  walletAddress: string;
  voiceCallRate?: number;
  videoCallRate?: number;
  languages?: [string];
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

  const user = userRepository.create(userData);

  if (data.languages) {
    for (const languageName of data.languages) {
      const language = await languageRepository.findOne({
        where: { name: languageName },
      });
      if (language) {
        const userLanguage = userLanguageRepository.create({
          user,
          language,
        });
        user.userLanguages.push(userLanguage);
      }
    }
  }
  const savedUser = await userRepository.save(user);
  return userHelper(savedUser);
}

export async function getUser(walletAddress: string) {
  const user = await userRepository.findOne({
    where: { walletAddress },
    relations: ["userLanguages.language"],
    select: {
      username: true,
      walletAddress: true,
      voiceCallRate: true,
      videoCallRate: true,
      userLanguages: true,
      role: true,
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
      username: true,
      walletAddress: true,
      voiceCallRate: true,
      videoCallRate: true,
      userLanguages: true,
      role: true,
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
    userLanguages?: UserLanguage[];
  },
) {
  data.userLanguages = [];
  const user = await userRepository.findOne({ where: { walletAddress } });
  if (user && data.languages) {
    userLanguageRepository.delete({ user });
    for (const languageName of data.languages) {
      const language = await languageRepository.findOne({
        where: { name: languageName },
      });
      if (language) {
        const userLanguage = userLanguageRepository.create({
          user,
          language,
        });
        data.userLanguages.push(userLanguage);
      }
    }
    delete data.languages;
  } else {
    throw new Error("User not found");
  }
  await userRepository.update({ walletAddress }, { ...data });
  const savedUser = await userRepository.findOne({
    where: { walletAddress },
    select: {
      username: true,
      walletAddress: true,
      voiceCallRate: true,
      videoCallRate: true,
      userLanguages: true,
      role: true,
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
    .leftJoinAndSelect("user.userLanguages", "userLanguage")
    .leftJoinAndSelect("userLanguage.language", "language");

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
