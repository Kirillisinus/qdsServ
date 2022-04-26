import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnterGame } from './socket.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    Users,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(
      {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: false,
        autoLoadEntities: true,
        extra: {
          rejectUnauthorized: false
        }
      }
    )
  ],
  controllers: [AppController],
  providers: [AppService, EnterGame],
})
export class AppModule {}
