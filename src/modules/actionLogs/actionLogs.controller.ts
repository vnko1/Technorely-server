import { Controller, Get, Query, UsePipes } from "@nestjs/common";

import { Role } from "src/types";
import { Roles } from "src/common/decorators";
import { CustomValidationPipe } from "src/common/pipes";

import { ActionLogsService } from "./actionLogs.service";
import { LogsQueryDto, LogsQuerySchema } from "./dto";

@Controller("logs")
export class ActionLogsController {
  constructor(private readonly logsService: ActionLogsService) {}

  @Get()
  @Roles(Role.SuperAdmin)
  @UsePipes(new CustomValidationPipe<LogsQueryDto>(LogsQuerySchema, "query"))
  getLogs(@Query() query: LogsQueryDto) {
    return this.logsService.getLogs(query);
  }
}
