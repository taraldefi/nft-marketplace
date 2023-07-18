import { AuctionBidEntity } from "src/modules/auctions/entities/auction.bid.entity";
import { Connection, EventSubscriber } from "typeorm";
import { AuctionBidHistoryEntity } from "../entities/auction.bid.history.entity";
import { BaseHistorySubscriber } from "src/modules/history/subscribers/base.subscriber";
import { Injectable } from "@nestjs/common";
import { Transactional } from "src/common/transaction/transaction";
import { runOnTransactionComplete, runOnTransactionRollback } from "src/common/transaction/hook";

@EventSubscriber()
@Injectable()
export class AuctionBidEntitySubscriber extends BaseHistorySubscriber<AuctionBidEntity, AuctionBidHistoryEntity> {
  constructor(connection: Connection) {
    super(connection, AuctionBidEntity, AuctionBidHistoryEntity);
  }

  @Transactional()
  protected copyEntityToHistory(entity: AuctionBidEntity, history: AuctionBidHistoryEntity): void {
    
    runOnTransactionRollback((cb) =>
      console.log('Rollback error on auction bid history transaction' + cb.message),
    );

    runOnTransactionComplete((cb) => console.log('Transaction Complete for inserting auction bid history'));
    
    console.log('Auction BID:::: ');
    console.log(JSON.stringify(entity, null, 2));
    
    history.auctionId = entity.auction.auctionId;
    history.createdAt = new Date();
    history.bidder = entity.bidder;
    history.amount = entity.amount;
  }
}