import { EntityRepository } from 'typeorm';
import { BaseSimpleRepository } from 'src/common/repository/base.simple.repository';
import { AuctionBidHistory } from '../entities/auction.bid.history.entity';

@EntityRepository(AuctionBidHistory)
export class AuctionBidHistoryRepository extends BaseSimpleRepository<AuctionBidHistory> {}
