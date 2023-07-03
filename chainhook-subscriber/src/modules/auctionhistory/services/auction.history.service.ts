import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuctionHistoryEntity } from '../entities/auction.history.entity';
import { AuctionBidHistoryEntity } from '../entities/auction.bid.history.entity';

@Injectable()
export class AuctionHistoryService {
  constructor(
    @InjectRepository(AuctionHistoryEntity)
    private auctionHistoryRepository: Repository<AuctionHistoryEntity>,
    @InjectRepository(AuctionBidHistoryEntity)
    private auctionBidsHistoryRepository: Repository<AuctionBidHistoryEntity>,
  ) {}

  async getHumanReadableAuctionHistory(auctionId: number): Promise<string> {
    const auctionHistory = await this.auctionHistoryRepository.find({ where: { auctionId: auctionId }, order: { createdAt: 'ASC' } });
    const bidsHistory = await this.auctionBidsHistoryRepository.find({ where: { auctionId: auctionId }, order: { createdAt: 'ASC' } });

    const allHistory = [...auctionHistory, ...bidsHistory].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const humanReadableAuctionHistory = allHistory.map((history) => {
      let actionText;
      let entityText;

      if (history instanceof AuctionHistoryEntity) {
        entityText = `Auction with the id "${history.auctionId}"`;
      } else {
        entityText = `Auction bid with the amount "${history.amount}" and bidder "${history.bidder}"`;
      }

      switch (history.action) {
        case 'insert':
          actionText = 'was created';
          break;
        case 'update':
          actionText = 'was updated';
          break;
        case 'delete':
          actionText = 'was deleted';
          break;
      }

      let changesText = history.changes.map(change => `The ${change.name} was changed to "${change.new_value}".`).join(' ');

      return `${entityText} ${actionText} at ${history.createdAt.toLocaleString()}. ${changesText}`;
    });

    return JSON.stringify(humanReadableAuctionHistory, null, 2);
  }
}