import { Inject, Injectable } from "@nestjs/common";
import { StartAuction } from "src/models";
import { AuctionEntityRepository } from "src/modules/auctions/repositories/auction.repository";
import { AuctionEntityRepositoryToken } from "src/modules/auctions/providers/auction.repository.provider";

@Injectable()
export class StartAuctionService {
  constructor(
    @Inject(AuctionEntityRepositoryToken)
    private auctionRepository: AuctionEntityRepository
  ) {}

  public async startAuction(startAuctionModel: StartAuction): Promise<void> {

    
    
  }
}