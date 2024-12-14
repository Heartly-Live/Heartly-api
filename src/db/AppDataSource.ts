import { DataSource } from "typeorm";
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const dbHost: string = process.env.dbHost || "localhost";
const dbPort: number = parseInt(process.env.dbPort || "3306");
const dbUsername: string = process.env.dbUsername || "root";
const dbPassword: string = process.env.dbPassword || "root";
const dbDatabse: string = process.env.dbDatabase || "soothdb";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: dbHost,
  port: dbPort,
  username: dbUsername,
  password: dbPassword,
  database: dbDatabse,
  entities: [User],
  synchronize: true,
});
