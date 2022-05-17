import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class gameSession {
  @Column('integer')
  creator: number;

  @Column('integer')
  prev: number;

  @Column('integer')
  data:string;

  @Column('integer')
  next:number;

  @PrimaryGeneratedColumn()
  id: number;
}
