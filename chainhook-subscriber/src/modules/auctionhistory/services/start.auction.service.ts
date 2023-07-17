import { Inject, Injectable } from "@nestjs/common";
import { StartAuction } from "src/models";
import { AuctionEntityRepository } from "src/modules/auctions/repositories/auction.repository";
import { AuctionEntityRepositoryToken } from "src/modules/auctions/providers/auction.repository.provider";
import { Transactional } from "src/common/transaction/transaction";
import { runOnTransactionComplete, runOnTransactionRollback } from "src/common/transaction/hook";
import { AuctionEntity } from "src/modules/auctions/entities/auction.entity";

@Injectable()
export class StartAuctionService {
  constructor(
    @Inject(AuctionEntityRepositoryToken)
    private auctionRepository: AuctionEntityRepository
  ) {}

  @Transactional()
  public async startAuction(startAuctionModel: StartAuction): Promise<void> {

    runOnTransactionRollback((cb) =>
      console.log('Rollback error ' + cb.message),
    );

    runOnTransactionComplete((_) => console.log('Transaction Complete'));
    
    const auction = new AuctionEntity();

    auction.auctionId = Number(startAuctionModel["auction-id"].value);
    auction.status = startAuctionModel["auction-status"].value;
    auction.endBlock = startAuctionModel["end-block"].value;
    auction.highestBid = startAuctionModel["highest-bid"].value;
    auction.highestBidder = startAuctionModel["highest-bidder"].value.value; 
    auction.nftAsset = startAuctionModel["nft-asset-contract"].value;

    await this.auctionRepository.save(auction);
  }
}