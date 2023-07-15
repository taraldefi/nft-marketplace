import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuctionEntity } from "src/modules/auctions/entities/auction.entity";
import { StartAuction } from "src/models";
import { AuctionEntityRepository } from "src/modules/auctions/repositories/auction.repository";

@Injectable()
export class StartAuctionService {
  constructor(
    @InjectRepository(AuctionEntity)
    private auctionRepository: AuctionEntityRepository
  ) {}

  public async startAuction(startAuctionModel: StartAuction): Promise<void> {


    
  }
}