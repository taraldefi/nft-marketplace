import { AuctionEntity } from "src/modules/auctions/entities/auction.entity";
import { Connection, EventSubscriber } from "typeorm";
import { AuctionHistoryEntity } from "../entities/auction.history.entity";
import { BaseHistorySubscriber } from "src/modules/history/subscribers/base.subscriber";
import { Injectable } from "@nestjs/common";
import { runOnTransactionComplete, runOnTransactionRollback } from "src/common/transaction/hook";
import { Transactional } from "src/common/transaction/transaction";

@EventSubscriber()
@Injectable()
export class AuctionEntitySubscriber extends BaseHistorySubscriber<AuctionEntity, AuctionHistoryEntity> {
  constructor(connection: Connection) {
    super(connection, AuctionEntity, AuctionHistoryEntity);
  }

  @Transactional()
  protected copyEntityToHistory(entity: AuctionEntity, history: AuctionHistoryEntity): void {
    runOnTransactionRollback((cb) =>
      console.log('Rollback error on auction bid history transaction' + cb.message),
    );

    runOnTransactionComplete((cb) => console.log('Transaction Complete for inserting auction bid history'));
    
    
    history.auctionId = entity.auctionId;
    history.endBlock = entity.endBlock;
    history.createdAt = new Date();

    history.highestBid = entity.highestBid;
    history.maker = entity.maker;

    history.highestBidder = entity.highestBidder;
    history.nftAsset = entity.nftAsset;
    history.status = entity.status;
  }
}


