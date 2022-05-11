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

  num_of_rounds: number = 0;
  round_now: number = 0;
  time_of_round:number = 15;

  arr_of_next_pages: string[] = [];

  admin_id:number=0;


  @SubscribeMessage('enterLobby')
  async enterLobby(client: Socket, payload: string): Promise<void> {
    await this.usersRepository.query("UPDATE users u SET in_game=false, in_lobby=true, socket_id=$1 WHERE u.user=$2",[client.id,payload]);

    const admin_if_ex = await this.usersRepository.query("SELECT u.id FROM users as u WHERE u.in_lobby=true AND u.socket_id IS NOT NULL AND is_admin=true");

    let admin_name = "";
    if(Object.keys(admin_if_ex).length <= 0){
      const admin_cand = await this.usersRepository.query("SELECT * FROM users as u WHERE u.user=$1",[payload]);
          await this.usersRepository.query("UPDATE users u SET is_admin=true WHERE u.user=$1",[payload]);
          this.admin_id = admin_cand[0].id;
          admin_name = admin_cand[0].user;
    }
    
    this.server.emit('enterMsg', admin_name);

    this.logger.log(`Client with id: ${client.id}`+" join to lobby");
  }

  @SubscribeMessage('exitLobby')
  async exitLobby(client: Socket, payload: string): Promise<void> {
    await this.usersRepository.query("UPDATE users u SET is_admin=false, in_lobby=false WHERE u.user=$1",[payload]);

    this.server.emit('exitMsg');

    this.logger.log(`Client with id: ${client.id}`+" left lobby");
  }

  /*@SubscribeMessage('ready')
  async ready(client: Socket, payload: string): Promise<void> {
    await this.usersRepository.query("UPDATE users u SET is_ready=true WHERE u.user=$1",[payload]);

    this.logger.log(`Client with id: ${client.id}`+" is ready now");
  }*/

  @SubscribeMessage('startGame')
  async startGame(client: Socket, data: string): Promise<void>{
    this.users = [];
    this.arr_of_next_pages = [];
    const clicked_usr = await this.usersRepository.query("SELECT * FROM users u WHERE u.user=$1",[data]);
    if(clicked_usr[0].is_admin === false) {
      return;
    }
    await this.usersRepository.query("UPDATE users u SET in_lobby=false, in_game=true WHERE u.in_lobby=true");

    const ids_of_users = await this.usersRepository.query("SELECT u.id FROM users u WHERE u.in_game=true AND u.socket_id IS NOT NULL");
    
    for(var i = 0; i<ids_of_users.length;i++){
      this.users.push(ids_of_users[i].id);
    }

    this.ready_of_all = ids_of_users.length;
    this.num_of_rounds = ids_of_users.length;

    let turn: boolean = false;
    for(var i = 1; i <= this.num_of_rounds; i++ ){
      if(i===this.num_of_rounds) {
        this.arr_of_next_pages.push("album");
      }
      else if(!turn){
        this.arr_of_next_pages.push("draw");
        turn = true;
      }
      else {
        this.arr_of_next_pages.push("write");
        turn = false;
      }
    }

    this.round_now = 0;

    this.logger.log("users: " + this.users);
    this.logger.log("ready_of_all: " + this.ready_of_all);
    this.logger.log("num_of_rounds: " + this.num_of_rounds);
    this.logger.log("round_now: " + this.round_now);
    this.logger.log("time_of_round: " + this.time_of_round);
    this.logger.log("arr_of_next_pages: " + this.arr_of_next_pages);
    this.logger.log("admin_id: " + this.admin_id);
    
  
    this.server.emit('startMsg', this.time_of_round);
  }

  @SubscribeMessage('writeSentence')
  async writeSentence(data: string){
      // запись в таблицу игровой сессии строки

      this.ready_of_all--;

      if(this.ready_of_all <=0){
        this.ready_of_all = this.users.length;

        if(this.users.length > 1) {
          this.logger.log(5*this.users.length);
          this.time_of_round += 5*this.users.length;
        }       

        this.logger.log("go to " + this.arr_of_next_pages[this.round_now]);
        this.logger.log("users: " + this.users);
        this.logger.log("ready_of_all: " + this.ready_of_all);
        this.logger.log("num_of_rounds: " + this.num_of_rounds);
        this.logger.log("round_now: " + this.round_now);
        this.logger.log("time_of_round: " + this.time_of_round);
        this.logger.log("arr_of_next_pages: " + this.arr_of_next_pages);
        this.logger.log("admin_id: " + this.admin_id);

        this.server.emit('goNextMsg', { next_page: this.arr_of_next_pages[this.round_now], round_time: this.time_of_round});   
        this.round_now++; 
      }
  }

  @SubscribeMessage('drawImage')
  async drawImage(data: string){
      //запись в таблицу игровой сессии строки изображения

      this.ready_of_all--;

      if(this.ready_of_all <=0){
        this.ready_of_all = this.users.length;

        if(this.users.length > 1) {        
          this.time_of_round += 5*this.users.length;
        }

        this.logger.log("go to " + this.arr_of_next_pages[this.round_now]);
        this.logger.log("users: " + this.users);
        this.logger.log("ready_of_all: " + this.ready_of_all);
        this.logger.log("num_of_rounds: " + this.num_of_rounds);
        this.logger.log("round_now: " + this.round_now);
        this.logger.log("time_of_round: " + this.time_of_round);
        this.logger.log("arr_of_next_pages: " + this.arr_of_next_pages);
        this.logger.log("admin_id: " + this.admin_id);

        this.server.emit('goNextMsg', { next_page: this.arr_of_next_pages[this.round_now], round_time: this.time_of_round});  
        this.round_now++;    
      }
  }

  @SubscribeMessage('timeIsUp')
  async timeIsUp(){
    this.server.emit('goNextMsg', this.arr_of_next_pages[this.round_now]);
    this.round_now++;
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  async handleDisconnect(client: Socket) {
    const usr1 = await this.usersRepository.query("SELECT * FROM users as u WHERE u.socket_id=$1",[client.id]);

    try{
    const index = this.users.indexOf(usr1[0].id, 0);
    if (index > -1) {
      this.users.splice(index, 1);
    }
    

    await this.usersRepository.query("UPDATE users u SET is_admin=false, in_lobby=false, socket_id=NULL WHERE u.socket_id=$1",[client.id]);
  
    this.server.emit('exitMsg',usr1[0].user);
   
    
    if(usr1[0].id === this.admin_id){
      const admin_cand = await this.usersRepository.query("SELECT u.id FROM users as u WHERE u.in_lobby=true AND u.socket_id IS NOT NULL ORDER BY u.exp_date DESC");
      if(Object.keys(admin_cand).length >=1){
          await this.usersRepository.query("UPDATE users u SET is_admin=true WHERE u.id=$1",[admin_cand[0].id]);
          this.admin_id = admin_cand[0].id;
      }
    }
    }
    catch{}
    
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  
}
