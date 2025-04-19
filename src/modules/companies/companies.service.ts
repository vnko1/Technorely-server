import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, DataSource, QueryRunner, Repository } from "typeorm";
import { instanceToPlain } from "class-transformer";
import { UploadApiOptions } from "cloudinary";
import { startOfDay, endOfDay } from "date-fns";

import { InstanceService } from "src/common/services";
import { IUser, LogsAction, Role } from "src/types";
import { errorMessages } from "src/utils";

import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { LogsService } from "../logs/logs.service";
import { UserEntity } from "../users/user.entity";

import { CompanyEntity } from "./company.entity";
import { CreateCompanyDto, CompaniesQueryDto, UpdateCompanyDto } from "./dto";

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
    private readonly dataSource: DataSource,
    private readonly logsService: LogsService
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

  private async findCompany(id: number, user: IUser, queryRunner: QueryRunner) {
    const company = await queryRunner.manager.findOne(CompanyEntity, {
      where: { id },
      relations: { user: true },
    });

    if (!company) throw new NotFoundException();
    if (user.role === Role.User && company.user.id !== user.id)
      throw new ForbiddenException();

    return company;
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
      company.userId = id;

      await queryRunner.manager.save(company);

      await this.logsService.log(
        {
          action: LogsAction.CREATE,
          userId: user.id,
          companyId: company.id,
          entityName: "Company",
          metadata: { reason: `${user.role} created ${company.name}` },
        },
        queryRunner
      );

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
    user: IUser,
    companyDto: UpdateCompanyDto,
    logo?: Express.Multer.File
  ) {
    let publicId: string | null = null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const company = await this.findCompany(id, user, queryRunner);

      this.parseData(company, companyDto);

      if (logo) {
        const { url, pId } = await this.uploadLogo(id, logo);
        company.logo = url;
        publicId = pId;
      }
      company.updatedAt = new Date().toISOString();
      await queryRunner.manager.save(company);

      await this.logsService.log(
        {
          action: LogsAction.UPDATE,
          userId: user.id,
          companyId: company.id,
          entityName: "Company",
          metadata: { reason: `${user.role} updated ${company.name}` },
        },
        queryRunner
      );

      await queryRunner.commitTransaction();
      return instanceToPlain(company);
    } catch (error) {
      if (publicId) await this.cloudinaryService.delete(publicId);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addOrChangeCompanyLogo(
    id: number,
    user: IUser,
    logo: Express.Multer.File
  ) {
    let publicId: string | null = null;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const company = await this.findCompany(id, user, queryRunner);

      const { url, pId } = await this.uploadLogo(id, logo);
      publicId = pId;
      company.logo = url;
      company.updatedAt = new Date().toISOString();

      await queryRunner.manager.save(company);

      await this.logsService.log(
        {
          action: LogsAction.UPDATE,
          userId: user.id,
          companyId: company.id,
          entityName: "Company",
          metadata: { reason: `${user.role} updated ${company.name} logo` },
        },
        queryRunner
      );

      await queryRunner.commitTransaction();
      return instanceToPlain(company);
    } catch (error) {
      if (publicId) await this.cloudinaryService.delete(publicId);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCompanyLogo(id: number, user: IUser) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const company = await this.findCompany(id, user, queryRunner);

      if (!company.logo) {
        throw new BadRequestException(errorMessages.logo.deleted);
      }

      await this.cloudinaryService.delete(company.logo);
      company.logo = null;
      company.updatedAt = new Date().toISOString();

      await queryRunner.manager.save(company);

      await this.logsService.log(
        {
          action: LogsAction.DELETE,
          userId: user.id,
          companyId: company.id,
          entityName: "Company",
          metadata: { reason: `${user.role} deleted ${company.name} logo` },
        },
        queryRunner
      );

      await queryRunner.commitTransaction();

      return instanceToPlain(company);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCompany(id: number, user: IUser) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const company = await this.findCompany(id, user, queryRunner);
      if (company.logo) {
        await this.cloudinaryService.delete(company.logo);
      }

      await queryRunner.manager.delete(CompanyEntity, company.id);

      await this.logsService.log(
        {
          action: LogsAction.DELETE,
          userId: user.id,
          companyId: company.id,
          entityName: "Company",
          metadata: { reason: `${user.role} deleted ${company.name}` },
        },
        queryRunner
      );
      return await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCompany(id: number, user: IUser) {
    const company = await this.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!company) throw new NotFoundException();
    if (user.role === Role.User && company.user.id !== user.id)
      throw new ForbiddenException();

    return instanceToPlain(company);
  }

  async getCompanies(query: CompaniesQueryDto, id?: number) {
    const {
      name = "ASC",
      service = "ASC",
      offset = 0,
      limit = 10,
      capital,
      createdAt,
    } = query;
    const queryParam: Record<string, unknown> = {};
    if (capital) {
      queryParam.capital = capital;
    }

    if (createdAt)
      queryParam.createdAt = Between(
        startOfDay(createdAt),
        endOfDay(createdAt)
      );
    if (id) queryParam.user = { id };

    const [companies, total] = await this.findAllAndCount({
      where: queryParam,
      order: { name, service },
      skip: offset,
      take: limit,
    });
    return { data: instanceToPlain(companies), meta: { total, offset, limit } };
  }
}
