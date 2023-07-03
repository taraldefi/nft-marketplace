import { AuctionBidEntity } from "src/modules/auctions/entities/auction.bid.entity";
import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { AuctionBidHistoryEntity } from "../entities/auction.bid.history.entity";

@EventSubscriber()
export class AuctionBidEntitySubscriber implements EntitySubscriberInterface<AuctionBidEntity> {
  constructor(connection: Connection) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return AuctionBidEntity;
  }

  afterInsert(event: InsertEvent<AuctionBidEntity>) {
    this.insertIntoHistory(event, 'insert');
  }

  afterUpdate(event: UpdateEvent<AuctionBidEntity>) {
    this.insertIntoHistory(event, 'update', event.updatedColumns);
  }

  private async insertIntoHistory(event: InsertEvent<AuctionBidEntity> | UpdateEvent<AuctionBidEntity>, action: 'insert' | 'update', updatedColumns = []) {
    const bid = event.entity;
    const bidHistory = new AuctionBidHistoryEntity();
    bidHistory.auctionId = bid.auction.auctionId;
    bidHistory.action = action;
    bidHistory.createdAt = new Date();
    bidHistory.bidder = bid.bidder;
    bidHistory.action = bid.amount;
    bidHistory.changes = updatedColumns.map(column => ({ name: column.propertyName, new_value: bid[column.propertyName] }));

    // Notice that we're using event.manager here.
    await event.manager.save(bidHistory);
  }
}