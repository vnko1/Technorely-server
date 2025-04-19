import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { LogsModule } from "./logs/logs.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { CompaniesModule } from "./companies/companies.module";

export default [
  CloudinaryModule,
  LogsModule,
  UsersModule,
  AuthModule,
  CompaniesModule,
];
