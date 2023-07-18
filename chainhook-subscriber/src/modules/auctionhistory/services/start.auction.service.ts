import { Inject, Injectable } from "@nestjs/common";
import { StartAuction } from "src/models";
import { AuctionEntityRepository } from "src/modules/auctions/repositories/auction.repository";
import { AuctionEntityRepositoryToken } from "src/modules/auctions/providers/auction.repository.provider";
import { Transactional } from "src/common/transaction/transaction";
import { runOnTransactionComplete, runOnTransactionRollback } from "src/common/transaction/hook";
import { AuctionEntity } from "src/modules/auctions/entities/auction.entity";
import { AuctionStatus } from "src/modules/auctions/entities/auction.status";
import { IsolationLevel } from "src/common/transaction/IsolationLevel";
import { BaseService } from "./base.service";

@Injectable()
export class StartAuctionService extends BaseService {
  constructor(
    @Inject(AuctionEntityRepositoryToken)
    private auctionRepository: AuctionEntityRepository
  ) {
    super();
  }

  @Transactional({
    isolationLevel: IsolationLevel.READ_COMMITTED,
  })
  public async startAuction(startAuctionModel: StartAuction): Promise<void> {

    this.setupTransactionHooks();

    this.Logger.info('Start Auction Service');
    this.Logger.info(JSON.stringify(startAuctionModel, null, 2));

    const existingAuction = await this.auctionRepository.findOne({
        where: { auctionId: Number(startAuctionModel["auction-id"].value)},
    });

    if (existingAuction != null) {
        return;
    }

    
    const auction = new AuctionEntity();

    auction.auctionId = Number(startAuctionModel["auction-id"].value);
    auction.status = AuctionStatus.OPEN;
    auction.endBlock = startAuctionModel["end-block"].value;
    auction.highestBid = startAuctionModel["highest-bid"].value;

    var highestBidder = startAuctionModel["highest-bidder"].value;

    auction.maker = startAuctionModel.maker.value;

    if (highestBidder != null) {
        var highestBidderValue = highestBidder.value;

        if (highestBidderValue != null) {

            auction.highestBidder = highestBidderValue;
        }
    }

    auction.nftAsset = startAuctionModel["nft-asset-contract"].value;

    await this.auctionRepository.save(auction);
  }
}