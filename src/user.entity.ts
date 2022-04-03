import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
  @Column('varchar')
  user: string;

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  cookie: string;

  @Column('timestamp without time zone')
  exp_date: Date;
}
