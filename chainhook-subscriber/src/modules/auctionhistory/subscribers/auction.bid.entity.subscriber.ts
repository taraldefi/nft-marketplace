import { AuctionBidEntity } from "src/modules/auctions/entities/auction.bid.entity";
import { Connection, EventSubscriber } from "typeorm";
import { AuctionBidHistoryEntity } from "../entities/auction.bid.history.entity";
import { BaseHistorySubscriber } from "src/modules/history/subscribers/base.subscriber";
import { Injectable } from "@nestjs/common";

@EventSubscriber()
@Injectable()
export class AuctionBidEntitySubscriber extends BaseHistorySubscriber<AuctionBidEntity, AuctionBidHistoryEntity> {
  constructor(connection: Connection) {
    super(connection, AuctionBidEntity, AuctionBidHistoryEntity);
  }

  protected copyEntityToHistory(entity: AuctionBidEntity, history: AuctionBidHistoryEntity): void {
    console.log('Auction:::: ');
    console.log(JSON.stringify(entity, null, 2));
    history.auctionId = entity.auction.auctionId;
    history.createdAt = new Date();
    history.bidder = entity.bidder;
    history.amount = entity.amount;
  }
}