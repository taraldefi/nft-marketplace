import { Inject, Injectable } from "@nestjs/common";
import { StartAuction } from "src/models";
import { AuctionEntityRepository } from "src/modules/auctions/repositories/auction.repository";
import { AuctionEntityRepositoryToken } from "src/modules/auctions/providers/auction.repository.provider";
import { Transactional } from "src/common/transaction/transaction";
import { AuctionEntity } from "src/modules/auctions/entities/auction.entity";
import { AuctionStatus } from "src/modules/auctions/entities/auction.status";
import { IsolationLevel } from "src/common/transaction/IsolationLevel";
import { BaseService } from "./base.service";
import { AuctionHistoryEntity } from "../entities/auction.history.entity";
import { AuctionHistoryEntityRepositoryToken } from "../providers/auction.history.repository.provider";
import { AuctionHistoryEntityRepository } from "../repositories/auction.history.repository";

@Injectable()
export class StartAuctionService extends BaseService<AuctionEntity, AuctionHistoryEntity> {
  
  constructor(
    @Inject(AuctionEntityRepositoryToken)
    private auctionRepository: AuctionEntityRepository,

    @Inject(AuctionHistoryEntityRepositoryToken)
    private auctionHistoryRepository: AuctionHistoryEntityRepository,
  ) {
    super(AuctionEntity, AuctionHistoryEntity, auctionHistoryRepository);
  }

  @Transactional({
    isolationLevel: IsolationLevel.READ_COMMITTED,
  })
  public async startAuction(startAuctionModel: StartAuction): Promise<void> {

    this.setupTransactionHooks();
    console.log("start auction");
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

    this.Logger.info('Auction Saved');

    await this.insertIntoHistory(null, auction, "insert", (entity: AuctionEntity, history: AuctionHistoryEntity) => {
      history.auctionId = entity.auctionId;
      history.endBlock = entity.endBlock;
      history.createdAt = new Date();
  
      history.highestBid = entity.highestBid;
      history.maker = entity.maker;
  
      history.highestBidder = entity.highestBidder;
      history.nftAsset = entity.nftAsset;
      history.status = entity.status;
    }, (entity: AuctionHistoryEntity) => this.auctionHistoryRepository.save(entity));
  }
}