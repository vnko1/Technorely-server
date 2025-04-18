import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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

  @Column()
  capital: string;

  @Column({ type: "int" })
  price: number;

  @Column({ nullable: true, type: "varchar" })
  logo: string | null;

  @Column({ type: "varchar", nullable: true })
  createdAt: string;

  @Column({ type: "varchar", nullable: true })
  updatedAt: string;

  @Exclude()
  @Column({ type: "varchar", nullable: true })
  deletedAt: string;

  @ManyToOne(() => UserEntity, (user) => user.companies)
  user: UserEntity;

  constructor(company?: CompanyDto) {
    if (!company) return;
    Object.entries(company).forEach(([key, value]) => (this[key] = value));
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}
