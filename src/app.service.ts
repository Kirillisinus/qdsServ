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
      const nextId = this.usersRepository.findOne({order: { id: "DESC", }});

      const user = new Users();
      user.id=(await nextId).id+1;
      user.user=name;
      user.exp_date = current ;
      user.in_game=false;
      user.in_lobby=false;
      user.is_admin=false;

      await this.usersRepository.save(user);
      
      ans.result="ok";
      return ans;
    }

    let current = new Date();    
    if(usr[0].exp_date < current) {
      current.setDate(current.getDate()+1);
      const user = usr;
      user[0].exp_date = current;
      await this.usersRepository.save({id:user[0].id, exp_date:user[0].exp_date});

      ans.result='ok';
      return ans;  
    }
    
    return ans;
  }

  async players(): Promise<any> {

  }
}
