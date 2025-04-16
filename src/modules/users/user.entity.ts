import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";

import { Role } from "src/types";

@Entity({ name: "user" })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: Role.User })
  role: Role;

  @Column({ nullable: true })
  avatar: string;

  @Exclude()
  @Column({ type: "varchar", nullable: true })
  passwordResetToken: string | null;

  @Column({ type: "varchar", nullable: true })
  createdAt: string;

  @Column({ type: "varchar", nullable: true })
  updatedAt: string;

  @Exclude()
  @Column({ type: "varchar", nullable: true })
  deletedAt: string;

  constructor(user?: { email: string }) {
    if (!user) return;
    this.email = user.email;
    this.username = user.email
      .split("@")[0]
      .replace(/^\w/, (c) => c.toUpperCase());
    this.createdAt = new Date().toISOString();
  }
}
