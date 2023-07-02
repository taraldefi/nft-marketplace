import {
    CreateDateColumn,
    Column,
    PrimaryGeneratedColumn,
    Check,
  } from 'typeorm';
  
  export abstract class BaseHistory {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    userId: number;
  
    @Column()
    @Check(`"action" IN ('insert', 'update', 'delete')`)
    action: 'insert' | 'update' | 'delete';
  
    @CreateDateColumn()
    createdAt: Date;
  }