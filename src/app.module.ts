import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import config from "src/config";
import appModules from "src/modules";

import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("db.host"),
        port: +configService.get("db.port"),
        username: configService.get("db.username"),
        password: configService.get("db.password"),
        database: configService.get("db.name"),
        ssl: true,
        entities: [__dirname + "/modules/**/entities/*.entity{.ts,.js}"],
        synchronize: true,
      }),
    }),
    ...appModules,
  ],
  controllers: [AppController],
})
export class AppModule {}
