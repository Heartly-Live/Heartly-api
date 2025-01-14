import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { UserLanguage } from "./UserLanguage";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

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

  @OneToMany(() => UserLanguage, (userLanguage) => userLanguage.user)
  userLanguages!: UserLanguage[];
}
