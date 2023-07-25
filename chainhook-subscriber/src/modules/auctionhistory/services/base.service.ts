import { BaseSimpleRepository } from "src/common/repository/base.simple.repository";
import { runOnTransactionCommit, runOnTransactionComplete, runOnTransactionRollback } from "src/common/transaction/hook";
import { BaseHistory } from "src/modules/history/entities/base.history.entity";

import * as winston from 'winston';

export abstract class BaseService<T extends { id: string }, H extends BaseHistory> {
    protected readonly Logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: 'error.log', level: 'error' }),
        ],
    });

    protected constructor(
        protected entity: new () => T,
        protected history: new () => H,
        protected readonly HRepository: BaseSimpleRepository<H>,
    ) {
    }

    protected setupTransactionHooks() {
        runOnTransactionRollback((cb) =>
            this.Logger.info(`[ROLLBACK] Error: ${cb.message}`),
        );


        runOnTransactionComplete((_) => this.Logger.info('[COMMIT] Transaction Complete'));
        runOnTransactionCommit(() => this.Logger.info('[COMMIT] Transaction Commit'));
    }

    protected async insertIntoHistory(oldEntity: T, newEntity: T, action: H['action'], 
        copyEntityToHistory: (entity: T, history: H) => void, 
        save: (history: H) => Promise<H>) {
        this.Logger.info('Inside insertIntoHistory');
        
        const entity = newEntity;

        const history = new this.history();
        history.action = action;
        history.createdAt = new Date();

        this.Logger.info('Inside insertIntoHistory - build changes');

        history.changes = this.buildChanges(oldEntity, newEntity);

        this.Logger.info('Inside insertIntoHistory - copy entity to history');

        copyEntityToHistory(entity, history);

        this.Logger.info('Inside insertIntoHistory - awaiting save');

        const cache = new Set();
        const replacer = (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
            // Duplicate reference found, discard key
            return;
            }
            // Store value in our set
            cache.add(value);
        }
        return value;
        };  

        console.log(JSON.stringify(history, replacer, 2));

        await save(history);
    }

    buildChanges(oldEntity: T, newEntity: T): Array<{ name: string, old_value: any, new_value: any }> {
        const changes = [];
    
        for (const key in newEntity) {
          if (!oldEntity || newEntity[key] !== oldEntity[key]) {
            changes.push({
              name: key,
              old_value: oldEntity ? oldEntity[key] : null,
              new_value: newEntity[key],
            });
          }
        }
    
        return changes;
    }
}