export interface User {
    user:string;
    id?: number;
    exp_date: Date;
    in_lobby:boolean;
    in_game:boolean;
    is_admin:boolean;
  };