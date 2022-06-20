import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Users } from './user.entity';
import { User } from './user.model';
import { EnterGame } from './socket.gateway';
import { gameSession } from './gameSession.entity';

class History {
  name: string
  items: any[]

  constructor(userName: string, array: string[]) {
    this.name = userName;
    this.items = array;
  }
}

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,

    @InjectRepository(gameSession)
    private readonly gameRepository: Repository<gameSession>,
  ) { }

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

  async getHistory(): Promise<any> {
    const users = await this.usersRepository.query(
      'SELECT * FROM users as u WHERE u.in_game=true AND u.socket_id IS NOT NULL AND u.exp_date > CURRENT_DATE ORDER BY u.id DESC;',
    );
    // console.log(users);
    const rounds = await this.gameRepository.query("SELECT creator FROM game_session group by creator order by creator ASC");
    // console.log(rounds);
    const users_in_session = await this.gameRepository.query("SELECT prev FROM game_session group by prev order by prev ASC");

    let history_items = [];

    let history_marker = 0;

    let history_obj: History[] = [];


    for (let i = 0; i < users_in_session.length; i++) {
      history_marker = users_in_session[i].prev;
      for (let j = 0; j < rounds.length; j++) {
        const game_session_for_user = await this.gameRepository.query("SELECT * FROM game_session WHERE creator = $1 AND prev = $2 order by creator ASC", [rounds[j].creator, history_marker]);

        history_marker = game_session_for_user[0].next;

        const name_of_user = await this.gameRepository.query("SELECT u.user FROM users as u WHERE u.id = $1", [game_session_for_user[0].prev]);

        const obj = {
          creator: name_of_user[0].user,
          data: game_session_for_user[0].data
        };

        history_items.push(obj);

      }
      const usr_for_history = await this.usersRepository.query(
        'SELECT u.user FROM users as u WHERE u.id=$1;', [users_in_session[i].prev]
      );
      history_obj[i] = new History(usr_for_history[0].user, history_items);
      history_items = [];
    }

    return history_obj;
  }

  async whatToDraw(name: string, creator: string): Promise<any> {
    this.usrs = [];
    const usr = await this.usersRepository.find({ where: { user: name } });
    const ids_of_users = await this.usersRepository.query(
      'SELECT u.id FROM users u WHERE u.in_game=true AND u.socket_id IS NOT NULL ORDER BY u.id DESC',
    );

    for (let i = 0; i < ids_of_users.length; i++) {
      this.usrs.push(ids_of_users[i].id);
    }
    this.turn = false;

    let crtr_id = 0;
    for (let i = 0; i < ids_of_users.length; i++) {
      if (ids_of_users[i].id === usr[0].id) {
        if (i - 1 < 0) {
          crtr_id = ids_of_users[ids_of_users.length - 1].id;
          i = ids_of_users.length;
        }
        else {
          crtr_id = ids_of_users[i - 1].id;
          i = ids_of_users.length;
        }
      }
    }
    const thing = await this.gameRepository.findOne({
      where: { next: usr[0].id, creator: creator },
    });
    const ans = { data: thing.data };

    return ans;
  }

  join(name: string): any { }
}