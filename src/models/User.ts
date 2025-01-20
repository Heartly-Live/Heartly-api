import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  ManyToMany,
} from "typeorm";
import { Language } from "./Language";
import { Expertise } from "./Expertise";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  walletAddress!: string;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  voiceCallRate: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  videoCallRate: number;

  @Column("varchar")
  nonce!: string;

  @Column("varchar", { default: "user" })
  role!: "user" | "listener";

  @Column({ default: "inactive" })
  status!: "active" | "inactive";

  @ManyToMany(() => Language, (language) => language.users, { cascade: true })
  @JoinTable()
  languages!: Language[];

  @ManyToMany(() => Expertise, (expertise) => expertise.users, {
    cascade: true,
  })
  @JoinTable()
  expertises!: Expertise[];
}
