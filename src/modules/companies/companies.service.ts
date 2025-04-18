import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { instanceToPlain } from "class-transformer";
// import { UploadApiOptions } from "cloudinary";

import { InstanceService } from "src/common/services";
import { Role } from "src/types";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { UserEntity } from "../users/user.entity";

import { CompanyEntity } from "./company.entity";
import { CreateCompanyDto } from "./dto";

// const companyUploadOption: UploadApiOptions = {
//   resource_type: "image",
//   folder: "technorely/companies",
//   overwrite: true,
// };

@Injectable()
export class CompaniesService extends InstanceService<CompanyEntity> {
  constructor(
    @InjectRepository(CompanyEntity)
    company: Repository<CompanyEntity>,
    private readonly cloudinaryService: CloudinaryService,
    private dataSource: DataSource
  ) {
    super(company);
  }

  async createCompany(companyDto: CreateCompanyDto, id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(UserEntity, {
        where: { id },
      });
      if (!user) throw new UnauthorizedException();

      const company = new CompanyEntity(companyDto);
      company.user = user;

      const savedCompany = await queryRunner.manager.save(company);

      await queryRunner.commitTransaction();

      return instanceToPlain(savedCompany);
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async updateCompany(id: number, user: { id: number; role: Role }) {
    const query =
      user.role === Role.SuperAdmin ? { id } : { id, user: { id: user.id } };

    const company = await this.findOne({
      where: query,
    });
    if (!company) throw new NotFoundException();

    return instanceToPlain(company);
  }

  async getUserCompanies(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(UserEntity, {
        where: { id },
        relations: { companies: true },
      });
      return user;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
