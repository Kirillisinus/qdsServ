import { Repository } from 'typeorm';
import { Users } from './user.entity';
export declare class AppService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<Users>);
    login(name: string): Promise<any>;
    players(): Promise<any>;
}
