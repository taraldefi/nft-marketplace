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

@Injectable()
export class PlaceBidService extends BaseService {
  constructor(
    @Inject(AuctionEntityRepositoryToken)
    private auctionRepository: AuctionEntityRepository,
    @Inject(AuctionBidEntityRepositoryToken)
    private auctionBidRepository: AuctionBidEntityRepository
  ) {
    super();
  }

  @Transactional({
    isolationLevel: IsolationLevel.READ_COMMITTED,
  })
  public async placeBid(placeBidModel: PlaceBid): Promise<void> {

    this.setupTransactionHooks();

    this.Logger.info('PLACE BID::::: ');
    this.Logger.info(JSON.stringify(placeBidModel, null, 2));
    
    const auction = await this.auctionRepository.findOneOrFail({
        where: { auctionId: Number(placeBidModel["auction-id"].value)},
        relations: ['bids'],
    });

    const bid = new AuctionBidEntity();
    bid.amount = Number(placeBidModel.bid.value);
    bid.bidder = placeBidModel.bidder.value;
    bid.auction = auction;

    await this.auctionBidRepository.save(bid);

    (auction.bids || []).push(bid);

    auction.highestBidder = bid.bidder;
    auction.highestBid = String(bid.amount);

    await this.auctionRepository.save(auction);
  }
}