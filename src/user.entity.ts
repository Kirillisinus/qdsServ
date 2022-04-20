import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @Column('varchar')
  user: string;

  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamp without time zone')
  exp_date: Date;

  @Column('boolean')
  in_lobby:boolean;

  @Column('boolean')
  in_game:boolean;

  @Column('boolean')
  is_admin:boolean;
}
