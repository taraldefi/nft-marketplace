import { Inject, Injectable } from "@nestjs/common";
import { PlaceBid, StartAuction } from "src/models";
import { AuctionEntityRepository } from "src/modules/auctions/repositories/auction.repository";
import { AuctionEntityRepositoryToken } from "src/modules/auctions/providers/auction.repository.provider";
import { Transactional } from "src/common/transaction/transaction";
import { runOnTransactionComplete, runOnTransactionRollback } from "src/common/transaction/hook";
import { AuctionBidEntity } from "src/modules/auctions/entities/auction.bid.entity";
import { AuctionBidEntityRepositoryToken } from "src/modules/auctions/providers/auction.bid.repository.provider";
import { AuctionBidEntityRepository } from "src/modules/auctions/repositories/auction.bid.entity.repository";

@Injectable()
export class PlaceBidService {
  constructor(
    @Inject(AuctionEntityRepositoryToken)
    private auctionRepository: AuctionEntityRepository,
    @Inject(AuctionBidEntityRepositoryToken)
    private auctionBidRepository: AuctionBidEntityRepository
  ) {}

  @Transactional()
  public async placeBid(placeBidModel: PlaceBid): Promise<void> {

    console.log('PLACE BID::::: ');
    console.log(JSON.stringify(placeBidModel, null, 2));

    runOnTransactionRollback((cb) =>
      console.log('Rollback error ' + cb.message),
    );

    runOnTransactionComplete((_) => console.log('Transaction Complete'));
    
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

    await this.auctionRepository.save(auction);
  }
}