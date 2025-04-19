import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { CompanyEntity } from "../companies/company.entity";
import { ActionLogsModule } from "../actionLogs/actionLogs.module";

import { UserEntity } from "./user.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CompanyEntity]),
    CloudinaryModule,
    ActionLogsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
