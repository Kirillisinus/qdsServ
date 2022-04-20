import { Socket, Server } from 'socket.io';
export declare class EnterGame {
    server: Server;
    private logger;
    handleMessage(client: Socket, payload: string): void;
    afterInit(server: Server): void;
    handleDisconnect(client: Socket): void;
    handleConnection(client: Socket, ...args: any[]): void;
}