import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { EnterGame } from './socket.gateway'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'appdb',
      entities: [Users],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Users])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
