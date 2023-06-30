import { Module } from '@nestjs/common';
import { AuctionSubscriberController } from './auction.subscriber.controller';

@Module({
  imports: [],
  controllers: [AuctionSubscriberController],
})
export class AuctionSubscriberModule {}
