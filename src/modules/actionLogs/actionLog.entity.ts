import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Exclude } from "class-transformer";

import { LogsAction } from "src/types";
import { UserEntity } from "../users/user.entity";
import { CompanyEntity } from "../companies/company.entity";

@Entity({ name: "logs" })
export class ActionLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: LogsAction })
  action: LogsAction;

  @Column()
  userId: number;

  @Column({ nullable: true })
  companyId: number;

  @Column({ nullable: true })
  entityName: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @Column({ type: "varchar", nullable: true })
  createdAt: string;

  @Exclude()
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @Exclude()
  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: "companyId" })
  company: CompanyEntity;
}
