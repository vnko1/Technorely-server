import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { instanceToPlain } from "class-transformer";
import { endOfDay, startOfDay } from "date-fns";
import { Between, DataSource, QueryRunner, Repository } from "typeorm";

import { LogsAction } from "src/types";

import { LogsQueryDto } from "./dto";
import { ActionLogEntity } from "./actionLog.entity";
import { InstanceService } from "src/common/services";
import { SocketGateway } from "../socket/socket.gateway";

type Params = {
  action: LogsAction;
  userId: number;
  companyId?: number;
  entityName?: string;
  entityId?: number;
  metadata?: Record<string, any>;
};

@Injectable()
export class ActionLogsService extends InstanceService<ActionLogEntity> {
  constructor(
    @InjectRepository(ActionLogEntity) logs: Repository<ActionLogEntity>,
    private readonly dataSource: DataSource,
    private readonly socket: SocketGateway
  ) {
    super(logs);
  }

  async log(params: Params, queryRunner?: QueryRunner) {
    const repo = queryRunner
      ? queryRunner.manager.getRepository(ActionLogEntity)
      : this.dataSource.getRepository(ActionLogEntity);

    const log = repo.create({
      ...params,
      createdAt: new Date().toISOString(),
    });

    const savedLog = await repo.save(log);

    this.socket.emitLog(savedLog);

    return savedLog;
  }

  async getLogs(queryDto: LogsQueryDto) {
    const {
      createdAt,
      offset = 0,
      limit = 10,
      sort = "ASC",
      action,
      entityName,
    } = queryDto;

    const queryParam: Record<string, unknown> = {};
    if (action) queryParam.action = action;
    if (entityName) queryParam.entityName = entityName;
    if (createdAt) {
      queryParam.createdAt = Between(
        startOfDay(createdAt),
        endOfDay(createdAt)
      );
    }

    const [logs, total] = await this.findAllAndCount({
      relations: { user: true, company: true },
      where: queryParam,
      order: { id: sort },
      skip: offset,
      take: limit,
    });

    return { data: instanceToPlain(logs), meta: { total, offset, limit } };
  }
}
