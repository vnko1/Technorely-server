import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";

import config from "src/config";
import appModules from "src/modules";

import { AppController } from "./app.controller";
import { RolesGuard } from "./common/guards";
import { JwtAuthGuard } from "./modules/auth/guards/jwt.guard";

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
        ssl: { ca: configService.get("db.ssl") },
        entities: [__dirname + "/modules/**/*.entity{.ts,.js}"],
        synchronize: true,
      }),
    }),
    ...appModules,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
