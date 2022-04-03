import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from "http";
import { Server } from "socket.io";

/*const httpServer = createServer();

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3003);*/

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  //app.enableCors();
  await app.listen(3000);
}
bootstrap();
