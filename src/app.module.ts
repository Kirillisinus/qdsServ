import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnterGame } from './socket.gateway'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './user.entity';
import { gameSession } from './gameSession.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'ec2-34-242-8-97.eu-west-1.compute.amazonaws.com',
      port: 5432,
      username: 'ikuzrwxffsywjz',
      password: '406099b9e10d2a079d3779910acb4309e7b59505ef02204a61998885a6eee1ad',
      database: 'd38sfo2rqhlo07',
      entities: [Users, gameSession],
      synchronize: false,
      logging: false,
      autoLoadEntities: true,
      ssl: { rejectUnauthorized: false }
    }),
    TypeOrmModule.forFeature([Users, gameSession])
  ],
  controllers: [AppController],
  providers: [AppService, EnterGame],
})
export class AppModule { }
