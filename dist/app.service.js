"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
let AppService = class AppService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async login(name) {
        let ans = { result: 'notok' };
        const usr = await this.usersRepository.find({ where: { user: name } });
        if (Object.keys(usr).length <= 0) {
            let current = new Date();
            current.setDate(current.getDate() + 1);
            const nextId = this.usersRepository.findOne({ order: { id: "DESC", } });
            const user = new user_entity_1.Users();
            user.id = (await nextId).id + 1;
            user.user = name;
            user.exp_date = current;
            user.in_game = false;
            user.in_lobby = false;
            user.is_admin = false;
            await this.usersRepository.save(user);
            ans.result = "ok";
            return ans;
        }
        let current = new Date();
        if (usr[0].exp_date < current) {
            current.setDate(current.getDate() + 1);
            const user = usr;
            user[0].exp_date = current;
            await this.usersRepository.save({ id: user[0].id, exp_date: user[0].exp_date });
            ans.result = 'ok';
            return ans;
        }
        return ans;
    }
    async players() {
    }
};
AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AppService);
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map