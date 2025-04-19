import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
} from "@nestjs/websockets";
import { Socket } from "socket.io";

import { ActionLogEntity } from "../actionLogs/actionLog.entity";

import { SocketService } from "./socket.service";

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Socket;

  constructor(private readonly socketService: SocketService) {}

  async handleConnection(socket: Socket): Promise<void> {
    await this.socketService.handleConnection(socket);
  }

  emitLog(log: ActionLogEntity) {
    this.server.emit("log:new", log);
  }
}
