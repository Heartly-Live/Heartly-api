import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Language } from "./Language";

@Entity()
export class UserLanguage {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.userLanguages)
  user!: User;

  @ManyToOne(() => Language, (language) => language.userLanguages)
  language!: Language;
}
