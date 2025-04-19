import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";

import { Role } from "src/types";
import { CompanyEntity } from "../companies/company.entity";

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

  @Column({ nullable: true, type: "varchar" })
  avatar: string | null;

  @Exclude()
  @Column({ type: "varchar", nullable: true })
  passwordResetToken: string | null;

  @Column({ type: "varchar", nullable: true })
  createdAt: string;

  @Column({ type: "varchar", nullable: true })
  updatedAt: string;

  @Exclude()
  @OneToMany(() => CompanyEntity, (company) => company.user)
  companies: CompanyEntity[];

  constructor(user?: { email: string }) {
    if (!user) return;
    this.email = user.email;
    this.username = user.email
      .split("@")[0]
      .replace(/^\w/, (c) => c.toUpperCase());

    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
