import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { ActionLogsModule } from "../actionLogs/actionLogs.module";
import { UserEntity } from "../users/user.entity";

import { CompanyEntity } from "./company.entity";
import { CompaniesService } from "./companies.service";
import { CompaniesController } from "./companies.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, UserEntity]),
    CloudinaryModule,
    ActionLogsModule,
  ],
  providers: [CompaniesService],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
