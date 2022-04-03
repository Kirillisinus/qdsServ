import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Users } from './user.entity';
import { User } from './user.model';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<User>,
  ) {}

  async login(name: string): Promise<any> {
    return await this.usersRepository.find({ where: { user: name } });
    console.log("Hi!");
  }
}
