import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { BaseController } from "./controller";
import { BaseService } from "./service";
import { BaseMiddleware } from "./middlewares";

@Module({
  imports: [],
  controllers: [BaseController],
  providers: [BaseService],
})
export class BaseModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BaseMiddleware).forRoutes(BaseController);
  }
}
