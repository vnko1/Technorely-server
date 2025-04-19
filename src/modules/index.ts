import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { SocketModule } from "./socket/socket.module";
import { ActionLogsModule } from "./actionLogs/actionLogs.module";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { CompaniesModule } from "./companies/companies.module";

export default [
  CloudinaryModule,
  SocketModule,
  ActionLogsModule,
  UsersModule,
  AuthModule,
  CompaniesModule,
];
