import { Body, Controller, Get, Header , Param, Post} from '@nestjs/common';
import { AppService } from './app.service';
import { Users } from './user.entity';
import { User } from './user.model';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('login/:name')
  async login(@Param('name') name): Promise<any> {
    return this.appService.login(name);
  }
}
