import { Inject, Injectable } from "@nestjs/common";
import { CancelAuction } from "src/models/cancel-auction.model";
import { AuctionEntityRepository } from "src/modules/auctions/repositories/auction.repository";
import { AuctionEntityRepositoryToken } from "src/modules/auctions/providers/auction.repository.provider";
import { Transactional } from "src/common/transaction/transaction";
import { runOnTransactionComplete, runOnTransactionRollback } from "src/common/transaction/hook";
import { AuctionStatus } from "src/modules/auctions/entities/auction.status";

@Injectable()
export class CancelAuctionService {
  constructor(
    @Inject(AuctionEntityRepositoryToken)
    private auctionRepository: AuctionEntityRepository
  ) {}

  @Transactional()
  public async cancelAuction(cancelAuctionModel: CancelAuction): Promise<void> {

    runOnTransactionRollback((cb) =>
      console.log('Rollback error ' + cb.message),
    );

    runOnTransactionComplete((_) => console.log('Transaction Complete'));
    
    const auction = await this.auctionRepository.findOneOrFail({
        where: { auctionId: Number(cancelAuctionModel["auction-id"].value)},
        relations: ['bids'],
    });

    auction.status = AuctionStatus.CANCELLED;

    await this.auctionRepository.save(auction);
  }
}