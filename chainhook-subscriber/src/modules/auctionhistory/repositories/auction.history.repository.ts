import { EntityRepository } from 'typeorm';
import { AuctionHistory } from '../entities/auction.history.entity';
import { BaseSimpleRepository } from 'src/common/repository/base.simple.repository';

@EntityRepository(AuctionHistory)
export class AuctionHistoryRepository extends BaseSimpleRepository<AuctionHistory> {}
