import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Users } from './user.entity';
import { User } from './user.model';
import { EnterGame } from './socket.gateway';
import { gameSession } from './gameSession.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(gameSession)
    private readonly gameRepository: Repository<gameSession>,
  ) {}

  usrs: number[] = [];
  turn: boolean = true;

  async login(name: string): Promise<any> {
    let ans: any = { result: 'notok' };

    const usr = await this.usersRepository.find({ where: { user: name } });

    if (Object.keys(usr).length <= 0) {
      let current = new Date();
      current.setDate(current.getDate() + 1);
      const nextId = await this.usersRepository.query(
        "SELECT nextval('user_pkid')",
      );

      /*const user = new Users();
      user.id=nextId[0].nextval;
      user.user=name;
      user.exp_date = current ;
      user.in_game=false;
      user.in_lobby=false;
      user.is_admin=false;*/

      await this.usersRepository.query(
        'INSERT INTO users(id, "user", exp_date, in_lobby, in_game, is_admin) VALUES ($1, $2, $3, $4, $5, $6)',
        [nextId[0].nextval, name, current, false, false, false],
      );

      ans.result = 'ok';
      return ans;
    }

    let current = new Date();
    current.setDate(current.getDate() + 1);
    const user = usr;
    user[0].exp_date = current;

    if (!usr[0].in_lobby || usr[0].in_game) {
      ans.result = 'ok';
      await this.usersRepository.save({
        id: user[0].id,
        exp_date: user[0].exp_date,
      });
      return ans;
    }

    return ans;
  }

  async players(): Promise<any> {
    const users = await this.usersRepository.query(
      'SELECT u.user FROM users as u where u.in_lobby=true and u.exp_date > CURRENT_DATE;',
    );
    return users;
  }

  /*async whatToWrite(name: string, creator: string): Promise<any> {
    const usr =  await this.usersRepository.find({ where: { user: name } });
    const sentence = await this.gameRepository.findOne({ where: { creator: creator, next: usr[0].id } });
    return sentence;
  }*/

  async whatToDraw(name: string, creator: string): Promise<any> {
    this.usrs = [];
    const usr = await this.usersRepository.find({ where: { user: name } });
    // console.log(usr);
    // console.log(creator);

    //if (this.turn) {
      const ids_of_users = await this.usersRepository.query(
        'SELECT u.id FROM users u WHERE u.in_game=true AND u.socket_id IS NOT NULL ORDER BY u.id DESC',
      );

      for (let i = 0; i < ids_of_users.length; i++) {
        this.usrs.push(ids_of_users[i].id);
      }
      //console.log(this.usrs);
      this.turn = false;
    //}

    let crtr_id = 0;
    for (let i = 0; i < ids_of_users.length; i++) {
      if (ids_of_users[i].id === usr[0].id) {
        if (i - 1 < 0) {
          crtr_id = ids_of_users[ids_of_users.length - 1].id;
          i = ids_of_users.length;
        }
        else{
        crtr_id = ids_of_users[i - 1].id;
        i = ids_of_users.length;
        }
      }
    }

    /*const usr_crtr = await this.usersRepository.find({
      where: { user: creator },
    });
    console.log(usr_crtr);*/
    creator
    const thing = await this.gameRepository.findOne({
      //where: { next: usr[0].id, creator: usr_crtr[0].id },
      where: { next: usr[0].id, creator: creator },
    });
    //console.log("For client with id " + usr[0].id + " creator(round) was " + creator + " and need do this: " + thing.data);
    //const ans = { data: thing.data, creator: usr_crtr[0].user };
    const ans = { data: thing.data};

    return ans;
  }

  join(name: string): any {}
}