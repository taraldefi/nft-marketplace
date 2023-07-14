import {
    Connection,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
    RemoveEvent,
  } from 'typeorm';
  import { BaseHistory } from '../entities/base.history.entity';
  
  export abstract class BaseHistorySubscriber<T extends { id: string }, H extends BaseHistory> implements EntitySubscriberInterface<T> {
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
      this.insertIntoHistory(event.entity as T, 'update', event.updatedColumns);
    }
  
    afterRemove(event: RemoveEvent<T>) {
      this.insertIntoHistory(event.entity, 'delete');
    }
  
    protected abstract copyEntityToHistory(entity: T, history: H): void;
  
    private async insertIntoHistory(entity: T, action: H['action'], updatedColumns = []) {
      const history = new this.history();
      history.action = action;
      history.createdAt = new Date();

      history.changes = updatedColumns.map(column => ({ name: column.propertyName, new_value: entity[column.propertyName] }));

      this.copyEntityToHistory(entity, history);
      await this.connection.manager.save(history);
    }
  }