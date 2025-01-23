import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Language } from "../models/Language";
import dotenv from "dotenv";
import { Expertise } from "../models/Expertise";

dotenv.config();

const dbHost: string = process.env.DB_HOST || "localhost";
const dbPort: number = parseInt(process.env.DB_PORT || "3306");
const dbUsername: string = process.env.DB_USERNAME || "root";
const dbPassword: string = process.env.DB_PASSWORD || "root";
const dbDatabse: string = process.env.DB_DATABASE || "soothdb";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: dbHost,
  port: dbPort,
  username: dbUsername,
  password: dbPassword,
  database: dbDatabse,
  entities: [User, Language, Expertise],
  synchronize: false,
});
