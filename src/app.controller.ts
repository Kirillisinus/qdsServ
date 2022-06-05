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

  @Get('players')
  async players(): Promise<any> {
    return this.appService.players();
  }

  @Get('join/:name')
  async join(@Param('name') name): Promise<any> {
    return this.appService.join(name);
  }

  @Get('whattomake/:name/:creator')
  async whatToDraw(@Param('name') name, @Param('creator') creator): Promise<any> {
    return this.appService.whatToDraw(name, creator);
  }

  @Get('history')
  async getHistory(): Promise<any> {
    return this.appService.getHistory();
  }
}
