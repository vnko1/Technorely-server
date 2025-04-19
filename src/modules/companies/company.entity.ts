import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Exclude } from "class-transformer";
import { UserEntity } from "../users/user.entity";
import { CompanyDto } from "src/common/dto";

@Entity({ name: "company" })
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  service: string;

  @Column({ type: "int" })
  capital: number;

  @Column({ nullable: true, type: "varchar" })
  logo: string | null;

  @Column({ type: "varchar", nullable: true })
  createdAt: string;

  @Column({ type: "varchar", nullable: true })
  updatedAt: string;

  @Column()
  userId: number;

  @Exclude()
  @ManyToOne(() => UserEntity, (user) => user.companies, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  constructor(company?: CompanyDto) {
    if (!company) return;
    Object.entries(company).forEach(([key, value]) => (this[key] = value));
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
