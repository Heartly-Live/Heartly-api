import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Language } from "./Language";

@Entity()
export class UserLanguage {
  @PrimaryGeneratedColumn()
  id!: number;
}
