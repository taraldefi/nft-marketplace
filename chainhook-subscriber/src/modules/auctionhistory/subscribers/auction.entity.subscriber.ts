import { AuctionEntity } from "src/modules/auctions/entities/auction.entity";
import { Connection, EventSubscriber } from "typeorm";
import { AuctionHistoryEntity } from "../entities/auction.history.entity";
import { BaseHistorySubscriber } from "src/modules/history/subscribers/base.subscriber";

@EventSubscriber()
export class AuctionEntitySubscriber extends BaseHistorySubscriber<AuctionEntity, AuctionHistoryEntity> {
  constructor(connection: Connection) {
    super(connection, AuctionEntity, AuctionHistoryEntity);
  }

  protected copyEntityToHistory(entity: AuctionEntity, history: AuctionHistoryEntity): void {
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