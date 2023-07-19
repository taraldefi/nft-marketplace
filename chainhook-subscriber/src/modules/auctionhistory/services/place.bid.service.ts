import { Inject, Injectable } from "@nestjs/common";
import { PlaceBid } from "src/models";
import { AuctionEntityRepository } from "src/modules/auctions/repositories/auction.repository";
import { AuctionEntityRepositoryToken } from "src/modules/auctions/providers/auction.repository.provider";
import { Transactional } from "src/common/transaction/transaction";
import { AuctionBidEntity } from "src/modules/auctions/entities/auction.bid.entity";
import { AuctionBidEntityRepositoryToken } from "src/modules/auctions/providers/auction.bid.repository.provider";
import { AuctionBidEntityRepository } from "src/modules/auctions/repositories/auction.bid.entity.repository";
import { IsolationLevel } from "src/common/transaction/IsolationLevel";
import { BaseService } from "./base.service";
import { AuctionBidHistoryEntityRepositoryToken } from "../providers/auction.bid.history.repository.provider";
import { AuctionBidHistoryEntityRepository } from "../repositories/auction.bid.history.repository";
import { AuctionBidHistoryEntity } from "../entities/auction.bid.history.entity";

@Injectable()
export class PlaceBidService extends BaseService<AuctionBidEntity, AuctionBidHistoryEntity> {
  
  constructor(
    @Inject(AuctionEntityRepositoryToken)
    private auctionRepository: AuctionEntityRepository,
    @Inject(AuctionBidEntityRepositoryToken)
    private auctionBidRepository: AuctionBidEntityRepository,
    @Inject(AuctionBidHistoryEntityRepositoryToken)
    private auctionBidHistoryRepository: AuctionBidHistoryEntityRepository,
  ) {
    super(AuctionBidEntity, AuctionBidHistoryEntity, auctionBidHistoryRepository);
  }

  @Transactional({
    isolationLevel: IsolationLevel.READ_COMMITTED,
  })
  public async placeBid(placeBidModel: PlaceBid): Promise<void> {

    console.log("placeBid");

    this.setupTransactionHooks();

    const auction = await this.auctionRepository.findOneOrFail({
        where: { auctionId: Number(placeBidModel["auction-id"].value)},
        relations: ['bids'],
    });

    const bid = new AuctionBidEntity();
    bid.amount = Number(placeBidModel.bid.value);
    bid.bidder = placeBidModel.bidder.value;

    await this.auctionBidRepository.save(bid);

    (auction.bids || []).push(bid);

    auction.highestBidder = bid.bidder;
    auction.highestBid = String(bid.amount);

    await this.auctionRepository.save(auction);

    this.Logger.info('Bid Saved');

    this.Logger.info('Inserting into history');

    await this.insertIntoHistory(null, bid, "insert", (entity: AuctionBidEntity, history: AuctionBidHistoryEntity) => {
      history.auctionId = auction.auctionId;
      history.createdAt = new Date();
      history.bidder = entity.bidder;
      history.amount = entity.amount;
    }, (entity: AuctionBidHistoryEntity) => this.HRepository.save(entity));

    
    this.Logger.info('Inserted into history');
  }
}