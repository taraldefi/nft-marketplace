import { Inject, Injectable } from "@nestjs/common";
import { StartAuction } from "src/models";
import { AuctionEntityRepository } from "src/modules/auctions/repositories/auction.repository";
import { AuctionEntityRepositoryToken } from "src/modules/auctions/providers/auction.repository.provider";
import { Transactional } from "src/common/transaction/transaction";
import { runOnTransactionComplete, runOnTransactionRollback } from "src/common/transaction/hook";
import { AuctionEntity } from "src/modules/auctions/entities/auction.entity";

@Injectable()
export class CancelAuctionService {
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
    
    const auction = await this.auctionRepository.findOneOrFail({auctionId: Number(startAuctionModel["auction-id"].value)})
    
    auction.status = startAuctionModel["auction-status"].value;

    await this.auctionRepository.save(auction);
  }
}