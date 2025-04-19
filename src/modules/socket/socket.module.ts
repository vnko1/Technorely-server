import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";

import { SocketGateway } from "./socket.gateway";
import { SocketService } from "./socket.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [JwtModule, UsersModule],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway],
})
export class SocketModule {}
