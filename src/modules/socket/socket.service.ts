import { Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { ConfigService } from "@nestjs/config";
import { Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";

import { UsersService } from "../users/users.service";
import { JwtPayloadType } from "src/types";

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, Socket> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.headers.token as string | undefined;

      if (!token) throw new WsException("Unauthorized");

      const payload: JwtPayloadType =
        await this.jwtService.verifyAsync<JwtPayloadType>(token, {
          secret: this.configService.get("jwt_secret"),
        });

      const user = await this.userService.findOneBy({ id: payload.sub });

      if (!user) throw new WsException("Unauthorized");

      const clientId = user.id.toString();
      this.connectedClients.set(clientId, socket);
      socket.on("disconnect", () => {
        this.connectedClients.delete(clientId);
      });
    } catch {
      socket.disconnect();
    }
  }

  emitEvent(event: string, data: any, userId: string) {
    const client = this.connectedClients.get(userId);

    if (client) client.emit(event, data);
  }
}
