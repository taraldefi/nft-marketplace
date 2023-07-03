import {
    CreateDateColumn,
    Column,
    PrimaryGeneratedColumn,
    Check,
  } from 'typeorm';
  
  export abstract class BaseHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    @Check(`"action" IN ('insert', 'update', 'delete')`)
    action: 'insert' | 'update' | 'delete';
  
    @CreateDateColumn()
    createdAt: Date;

    @Column('json', { default: {} })
    changes: any;
  }