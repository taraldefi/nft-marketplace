import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionEntity } from './entities/auction.entity';
import { AuctionBidEntity } from './entities/auction.bid.entity';
import { AuctionHistoryController } from '../auctionhistory/controllers/auction.history.controller';
import { AuctionHistoryService } from '../auctionhistory/services/auction.history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        AuctionEntity, AuctionBidEntity
    ]),
  ],
  controllers: [AuctionHistoryController],
  providers: [
    ConfigModule,
    ConfigService,
    AuctionHistoryService
  ],
})
export class AuctionModule {}
