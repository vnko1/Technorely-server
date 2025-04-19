import { Controller, Get } from "@nestjs/common";

@Controller("logs")
export class ActionLogsController {
  constructor() {}

  @Get()
  getLogs() {}
}
