import { Injectable } from "@nestjs/common";

import { AppService } from "src/common/services";

@Injectable()
export class BaseService extends AppService {
  constructor() {
    super();
  }
  getHello(): string {
    return "Hello World!";
  }
}
