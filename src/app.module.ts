import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnterGame } from './socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './user.entity';
import { ConfigModule } from '@nestjs/config';
import { gameSession } from './gameSession.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      /*type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'appdb',
      entities: [Users,gameSession],
      synchronize: false,
      logging: true
      */
      type: 'postgres',
      host: 'ec2-63-32-248-14.eu-west-1.compute.amazonaws.com',
      port: 5432,
      username: 'awjqkgiaynfnrq',
      password: 'c69dd8fdc4129e39e5375e06c720358b4598d8d55a640fabd3fd59ebbbb2aed8',
      database: 'd1uvmmelf3brrh',
      entities: [Users, gameSession],
      synchronize: false,
      logging: true,
      autoLoadEntities: true,
      ssl: { rejectUnauthorized: false }
    }),
    TypeOrmModule.forFeature([Users, gameSession])
  ],
  controllers: [AppController],
  providers: [AppService, EnterGame],
})
export class AppModule { }
