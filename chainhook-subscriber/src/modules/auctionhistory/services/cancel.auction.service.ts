import { Inject, Injectable } from "@nestjs/common";
import { CancelAuction } from "src/models/cancel-auction.model";
import { AuctionEntityRepository } from "src/modules/auctions/repositories/auction.repository";
import { AuctionEntityRepositoryToken } from "src/modules/auctions/providers/auction.repository.provider";
import { Transactional } from "src/common/transaction/transaction";
import { runOnTransactionComplete, runOnTransactionRollback } from "src/common/transaction/hook";
import { AuctionStatus } from "src/modules/auctions/entities/auction.status";
import { IsolationLevel } from "src/common/transaction/IsolationLevel";
import { BaseService } from "./base.service";

@Injectable()
export class CancelAuctionService extends BaseService {
  constructor(
    @Inject(AuctionEntityRepositoryToken)
    private auctionRepository: AuctionEntityRepository
  ) {
    super();
  }

  @Transactional({
    isolationLevel: IsolationLevel.READ_COMMITTED,
  })
  public async cancelAuction(cancelAuctionModel: CancelAuction): Promise<void> {

    this.setupTransactionHooks();
    
    const auction = await this.auctionRepository.findOneOrFail({
        where: { auctionId: Number(cancelAuctionModel["auction-id"].value)},
        relations: ['bids'],
    });

    auction.status = AuctionStatus.CANCELLED;

    await this.auctionRepository.save(auction);
  }
}