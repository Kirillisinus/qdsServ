import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Users } from './user.entity';
import { User } from './user.model';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}


  async login(name: string): Promise<any> {
    let ans:any = {result:'notok'};

    const usr =  await this.usersRepository.find({ where: { user: name } });

    if(Object.keys(usr).length<=0){
      let current = new Date();
      current.setDate(current.getDate()+1);
      const nextId = await this.usersRepository.query('SELECT nextval(\'user_pkid\')');

      /*const user = new Users();
      user.id=nextId[0].nextval;
      user.user=name;
      user.exp_date = current ;
      user.in_game=false;
      user.in_lobby=false;
      user.is_admin=false;*/

      await this.usersRepository.query("INSERT INTO users(id, \"user\", exp_date, in_lobby, in_game, is_admin) VALUES ($1, $2, $3, $4, $5, $6)",[nextId[0].nextval,name,current,false,false,false]);
      
      ans.result="ok";
      return ans;
    }

    /*if(usr[0].exp_date < current) {
      let current = new Date();  
      current.setDate(current.getDate()+1);
      const user = usr;
      user[0].exp_date = current;
      await this.usersRepository.save({id:user[0].id, exp_date:user[0].exp_date});

      ans.result='ok';
      return ans;  
    }*/
    ans.result='ok';
    return ans;
  }

  async players(): Promise<any> {
    const users =  await this.usersRepository.query("SELECT u.user FROM users as u where u.in_lobby=true and u.exp_date > CURRENT_DATE;");
    return users;
  }
}
