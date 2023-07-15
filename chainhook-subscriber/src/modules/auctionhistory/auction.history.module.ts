import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionHistoryEntity } from './entities/auction.history.entity';
import { AuctionBidHistoryEntity } from './entities/auction.bid.history.entity';
import { AuctionHistoryController } from './controllers/auction.history.controller';
import { AuctionHistoryService } from './services/auction.history.service';
import { AuctionSubscriberController } from './controllers/auction.subscriber.controller';
import { RabbitMQHealthService } from './services/rabbitmq.health.service';
import { LoggerModule } from '../logger/logger.module';
import { RabbitmqService } from './services/rabbitmq.service';
import { StartAuctionService } from './services/start.auction.service';
import { AuctionModule } from '../auctions/auction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        AuctionHistoryEntity, AuctionBidHistoryEntity
    ]),
    LoggerModule,
    AuctionModule
  ],
  controllers: [AuctionHistoryController, AuctionSubscriberController],
  providers: [
    ConfigModule,
    ConfigService,
    AuctionHistoryService,
    RabbitMQHealthService,
    RabbitmqService,
    StartAuctionService
  ],
})
export class AuctionHistoryModule {}
