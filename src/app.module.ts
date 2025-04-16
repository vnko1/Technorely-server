import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import config from "src/config";
import appModules from "src/modules";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    ...appModules,
  ],
})
export class AppModule {}
