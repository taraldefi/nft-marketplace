import { AuctionEntity } from "src/modules/auctions/entities/auction.entity";
import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { AuctionHistoryEntity } from "../entities/auction.history.entity";

@EventSubscriber()
export class AuctionEntitySubscriber implements EntitySubscriberInterface<AuctionEntity> {
  constructor(connection: Connection) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return AuctionEntity;
  }

  afterInsert(event: InsertEvent<AuctionEntity>) {
    this.insertIntoHistory(event.entity, event.manager, 'insert');
  }

  afterUpdate(event: UpdateEvent<AuctionEntity>) {
    this.insertIntoHistory(event.entity as AuctionEntity, event.manager, 'update', event.updatedColumns);
  }

  private async insertIntoHistory(auction: AuctionEntity, manager: any, action: 'insert' | 'update', updatedColumns = []) {
    const auctionHistory = new AuctionHistoryEntity();
    auctionHistory.auctionId = auction.auctionId;
    auctionHistory.endBlock = auction.endBlock;
    auctionHistory.createdAt = new Date();

    auctionHistory.highestBid = auction.highestBid;

    auctionHistory.highestBidder = auction.highestBidder;
    auctionHistory.nftAsset = auction.nftAsset;
    auctionHistory.status = auction.status;

    auctionHistory.action = action;

    auctionHistory.changes = updatedColumns.map(column => ({ name: column.propertyName, new_value: auction[column.propertyName] }));
    await manager.save(auctionHistory);
  }
}