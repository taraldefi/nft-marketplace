import {
    Connection,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
    RemoveEvent,
  } from 'typeorm';
  import { BaseHistory } from '../entities/base.history.entity';
  
  export abstract class BaseHistorySubscriber<T extends { id: number }, H extends BaseHistory> implements EntitySubscriberInterface<T> {
    constructor(
      protected connection: Connection,
      protected entity: new () => T,
      protected history: new () => H
    ) {
      connection.subscribers.push(this);
    }
  
    listenTo() {
      return this.entity;
    }
  
    afterInsert(event: InsertEvent<T>) {
      this.insertIntoHistory(event.entity, 'insert');
    }
  
    afterUpdate(event: UpdateEvent<T>) {
      this.insertIntoHistory(event.entity as T, 'update');
    }
  
    afterRemove(event: RemoveEvent<T>) {
      this.insertIntoHistory(event.entity, 'delete');
    }
  
    protected abstract copyEntityToHistory(entity: T, history: H): void;
  
    private async insertIntoHistory(entity: T, action: H['action']) {
      const history = new this.history();
      history.action = action;
      history.userId = entity.id;  // assuming that entity.id is the user ID
      this.copyEntityToHistory(entity, history);
      await this.connection.manager.save(history);
    }
  }