import { runOnTransactionCommit, runOnTransactionComplete, runOnTransactionRollback } from "src/common/transaction/hook";

import * as winston from 'winston';

export abstract class BaseService {
    protected readonly Logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: 'error.log', level: 'error' }),
        ],
    });

    protected setupTransactionHooks() {
        runOnTransactionRollback((cb) =>
            this.Logger.info(`[ROLLBACK] Error: ${cb.message}`),
        );
        

        runOnTransactionComplete((_) => this.Logger.info('[COMMIT] Transaction Complete'));

        runOnTransactionCommit(() => this.Logger.info('[COMMIT] Transaction Commit'));
    }
}