import {WebSocketGateway,SubscribeMessage,MessageBody, WebSocketServer} from "@nestjs/websockets"
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class EnterGame{
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('EnterGame');

    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, payload: string): void {
      this.server.emit('msgToClient', payload);
    }
  
    afterInit(server: Server) {
      this.logger.log('Init');
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
      }
}