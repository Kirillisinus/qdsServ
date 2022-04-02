import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnterGame } from './socket.gateway'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService,EnterGame],
})
export class AppModule {}
