import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

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

  @Column("varchar", { default: () => "FLOOR(RANDOM()*1000000) :: text" })
  nonce!: string;

  @Column({ default: "inactive" })
  status!: "active" | "inactive";
}
