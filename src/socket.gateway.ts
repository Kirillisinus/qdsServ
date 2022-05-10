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
    origin: '*',
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
  
  users: number[] = [];
  ready_of_all: number = 0;


  @SubscribeMessage('enterLobby')
  async enterLobby(client: Socket, payload: string): Promise<void> {
    await this.usersRepository.query("UPDATE users u SET in_game=false, in_lobby=true, socket_id=$1 WHERE u.user=$2",[client.id,payload]);

    const usr1 = await this.usersRepository.query("SELECT u.user FROM users as u WHERE u.socket_id=$1",[client.id]);
    this.server.emit('enterMsg',usr1[0]);

    this.logger.log(`Client with id: ${client.id}`+" join to lobby");
  }

  @SubscribeMessage('exitLobby')
  async exitLobby(client: Socket, payload: string): Promise<void> {
    await this.usersRepository.query("UPDATE users u SET in_lobby=false WHERE u.user=$1",[payload]);

    const usr1 = await this.usersRepository.query("SELECT u.user FROM users as u WHERE u.socket_id=$1",[client.id]);
    this.server.emit('exitMsg',usr1[0]);

    this.logger.log(`Client with id: ${client.id}`+" left lobby");
  }

  /*@SubscribeMessage('ready')
  async ready(client: Socket, payload: string): Promise<void> {
    await this.usersRepository.query("UPDATE users u SET is_ready=true WHERE u.user=$1",[payload]);

    this.logger.log(`Client with id: ${client.id}`+" is ready now");
  }*/

  @SubscribeMessage('startGame')
  async startGame(){
    await this.usersRepository.query("UPDATE users u SET in_lobby=false, in_game=true WHERE u.in_lobby=true");

    const ids_of_users = await this.usersRepository.query("SELECT u.id FROM users u WHERE u.in_game=true");
    
    for(var i = 0; i<ids_of_users.length;i++){
      this.users.push(ids_of_users[i].id);
    }

    this.ready_of_all = ids_of_users.length;    
  
    this.server.emit('startMsg');
  }

  @SubscribeMessage('writeSentence')
  async writeSentence(data: string){
      // запись в таблицу игровой сессии строки

      this.ready_of_all--;

      if(this.ready_of_all <=0){
        this.ready_of_all = this.users.length;
      }
      
      this.server.emit('goNextMsg');
  }

  @SubscribeMessage('drawImage')
  async drawImage(data: string){
      //запись в таблицу игровой сессии строки изображения

      this.ready_of_all--;

      if(this.ready_of_all <=0){
        this.ready_of_all = this.users.length;
      }
      
      this.server.emit('goNextMsg');
  }

  @SubscribeMessage('timeIsUp')
  async timeIsUp(){
    
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  async handleDisconnect(client: Socket) {
    const usr1 = await this.usersRepository.query("SELECT u.user FROM users as u WHERE u.socket_id=$1",[client.id]);
    const usr1_name = await this.usersRepository.query("SELECT u.id FROM users as u WHERE u.socket_id=$1",[client.id]);

    try{
    const index = this.users.indexOf(usr1_name[0].id, 0);
    if (index > -1) {
      this.users.splice(index, 1);
    }
    }
    catch{}

    await this.usersRepository.query("UPDATE users u SET in_game=false, in_lobby=false, socket_id=NULL WHERE u.socket_id=$1",[client.id]);

    this.server.emit('exitMsg',usr1[0]);
    
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  
}
