import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";

import { AppModule } from "../app.module";

import { Role } from "src/types/enums";
import { UserEntity } from "src/modules/users/user.entity";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const dataSource = app.get(DataSource);
  const userRepo = dataSource.getRepository(UserEntity);

  const email = configService.get<string>("superAdmin.email");
  const rawPassword = configService.get<string>("superAdmin.password");

  if (!email || !rawPassword) {
    console.error("Add email and password at .env");
    return await app.close();
  }

  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    console.error("Super admin is existing");
    return await app.close();
  }

  const password = await bcrypt.hash(rawPassword, 10);

  const user = userRepo.create({
    email,
    username: email.split("@")[0],
    password,
    role: Role.SuperAdmin,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await userRepo.save(user);
  console.log("Super admin successfully created!");
  await app.close();
}

bootstrap().catch(console.error);
