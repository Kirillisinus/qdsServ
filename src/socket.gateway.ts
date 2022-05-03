import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Users } from './user.entity';


@WebSocketGateway({
  cors: {
    origin: 'http://localhost:8080',
    credentials: true,
    allowEIO3: true
  },
})
export class EnterGame {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('EnterGame');

  @SubscribeMessage('enterLobby')
  async enterLobby(client: Socket, payload: string): Promise<void> {
    await this.usersRepository.query("UPDATE users u SET in_lobby=true, socket_id=$1 WHERE u.user=$2",[client.id,payload]);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  async handleDisconnect(client: Socket) {
    await this.usersRepository.query("UPDATE users u SET in_lobby=false, socket_id=NULL WHERE u.socket_id=$1",[client.id]);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    const usr = await this.usersRepository.query("SELECT user FROM users as u WHERE u.socket_id=$1",[client.id]);
    this.server.emit('msg',usr[0]);
    this.logger.log(`Client connected: ${client.id}`);
  }

  
}
