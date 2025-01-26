import { Repository } from "typeorm";
import { AppDataSource } from "../db/AppDataSource";
import { User } from "../models/User";
import crypto from "crypto";
import { Language } from "../models/Language";
import { Expertise } from "../models/Expertise";

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const languageRepository: Repository<Language> =
  AppDataSource.getRepository(Language);
const expertiseRepository: Repository<Expertise> =
  AppDataSource.getRepository(Expertise);

const userHelper = (
  user: User,
): {
  username: string;
  walletAddress: string;
  voicecallRate: number;
  videoCallRate: number;
  languages: string[];
  expertises: string[];
  role: string;
} => {
  return {
    username: user.username,
    walletAddress: user.walletAddress,
    voicecallRate: user.voiceCallRate,
    videoCallRate: user.videoCallRate,
    languages: user.languages.map((language) => language.name),
    expertises: user.expertises.map((expertise) => expertise.name),
    role: user.role,
  };
};

export async function checkUsername(username: string) {
  const user = await userRepository.findOne({ where: { username } });
  if (!user) {
    return true;
  } else {
    throw new Error("User already exists");
  }
}

export async function createUser(data: {
  username?: string;
  walletAddress: string;
  voiceCallRate?: number;
  videoCallRate?: number;
  languages?: string[];
  expertises?: string[];
}) {
  const newNonce: string = crypto.randomBytes(16).toString("hex");
  const userData: {
    username?: string;
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

  const expertises: Expertise[] = [];

  if (data.expertises) {
    for (const expertiseName of data.expertises) {
      const expertise = await expertiseRepository.findOne({
        where: { name: expertiseName },
      });
      if (expertise) expertises.push(expertise);
    }
  }
  const user = userRepository.create({ ...userData, languages, expertises });

  const savedUser = await userRepository.save(user);
  return userHelper(savedUser);
}

export async function getUserByWalletAddress(walletAddress: string) {
  const user = await userRepository.findOne({
    where: { walletAddress },
    relations: {
      languages: true,
      expertises: true,
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
    relations: ["languages", "expertises"],
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
    relations: ["languages", "expertises"],
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
    voiceCallRate?: number;
    videoCallRate?: number;
    languages?: string[];
    expertises?: string[];
  },
) {
  const user = await userRepository.findOne({
    where: { walletAddress },
    relations: ["languages", "expertises"],
  });
  const languages: Language[] = [];
  const expertises: Expertise[] = [];
  if (!user) {
    throw new Error("Cannot find user");
  } else {
    if (data.languages) {
      for (const languageName of data.languages) {
        const language = await languageRepository.findOne({
          where: { name: languageName },
        });
        if (language) languages.push(language);
      }
      delete data.languages;
      user.languages = languages;
    }
    if (data.expertises) {
      for (const expertiseName of data.expertises) {
        const expertise = await expertiseRepository.findOne({
          where: { name: expertiseName },
        });
        if (expertise) expertises.push(expertise);
      }
      delete data.expertises;
      user.expertises = expertises;
    }
    if (data.voiceCallRate) user.voiceCallRate = data.voiceCallRate;
    if (data.videoCallRate) user.videoCallRate = data.videoCallRate;
  }
  await userRepository.save(user);
  const savedUser = await userRepository.findOne({
    where: { walletAddress },
    relations: ["languages", "expertises"],
    select: {
      nonce: false,
      id: false,
      status: false,
    },
  });

  if (!savedUser) {
    throw new Error("Cannot update user");
  }

  return userHelper(savedUser);
}

export async function getAllListeners(
  languages: string[] = [],
  expertises: string[] = [],
  status?: string,
) {
  const query = userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.languages", "language")
    .leftJoinAndSelect("user.expertises", "expertise")
    .where("user.role = :role", { role: "listener" });

  if (languages.length > 0) {
    query.andWhere("language.name IN (:...languages)", { languages });
  }

  if (expertises.length > 0) {
    query.andWhere("expertise.name IN (:...expertises)", { expertises });
  }

  if (status === "active") {
    query.andWhere("user.status like 'active'");
  }
  const listeners: User[] = await query.getMany();

  const data = [];
  if (listeners) {
    for (const listener of listeners) {
      data.push(userHelper(listener));
    }
  } else {
    throw new Error("Listeners not found");
  }

  return data;
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

export async function changeRoleToListener(walletAddress: string) {
  await userRepository.update({ walletAddress }, { role: "listener" });
  return userRepository.findOne({
    where: { walletAddress },
    select: { walletAddress: true, role: true, status: true },
  });
}
