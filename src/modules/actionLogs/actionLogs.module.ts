import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserEntity } from "../users/user.entity";
import { CompanyEntity } from "../companies/company.entity";

import { ActionLogsController } from "./actionLogs.controller";
import { ActionLogEntity } from "./actionLog.entity";
import { ActionLogsService } from "./actionLogs.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ActionLogEntity, UserEntity, CompanyEntity]),
  ],
  providers: [ActionLogsService],
  controllers: [ActionLogsController],
  exports: [ActionLogsService],
})
export class ActionLogsModule {}
