import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { instanceToPlain } from "class-transformer";
import { UploadApiOptions } from "cloudinary";

import { InstanceService } from "src/common/services";
import { Role } from "src/types";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { UserEntity } from "../users/user.entity";

import { CompanyEntity } from "./company.entity";
import { CreateCompanyDto, UpdateCompanyDto } from "./dto";

const companyUploadOption: UploadApiOptions = {
  resource_type: "image",
  folder: "technorely/companies",
  overwrite: true,
};

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

  private async uploadLogo(id: number, avatar: Express.Multer.File) {
    const response = await this.cloudinaryService.upload(avatar.path, {
      ...companyUploadOption,
      public_id: id.toString(),
    });
    const url = this.cloudinaryService.edit(response.secure_url, {
      fetch_format: "auto",
      quality: "auto",
    });
    return { url, pId: response.public_id };
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

      await queryRunner.manager.save(company);

      await queryRunner.commitTransaction();

      return instanceToPlain(company);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCompany(
    id: number,
    user: { id: number; role: Role },
    companyDto: UpdateCompanyDto,
    logo?: Express.Multer.File
  ) {
    let publicId: string | null = null;
    const query =
      user.role === Role.SuperAdmin ? { id } : { id, user: { id: user.id } };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const company = await queryRunner.manager.findOne(CompanyEntity, {
        where: query,
      });

      if (!company) throw new NotFoundException();

      this.parseData(company, companyDto);

      if (logo) {
        const { url, pId } = await this.uploadLogo(id, logo);
        company.logo = url;
        publicId = pId;
      }

      await queryRunner.manager.save(company);
      await queryRunner.commitTransaction();
      return instanceToPlain(company);
    } catch (error) {
      console.error(error);
      if (publicId) await this.cloudinaryService.delete(publicId);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
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
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
