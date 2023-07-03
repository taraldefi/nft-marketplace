import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionHistoryEntity } from './entities/auction.history.entity';
import { AuctionBidHistoryEntity } from './entities/auction.bid.history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        AuctionHistoryEntity, AuctionBidHistoryEntity
    ]),
  ],
  controllers: [],
  providers: [
    ConfigModule,
    ConfigService
  ],
})
export class AuctionHistoryModule {}
