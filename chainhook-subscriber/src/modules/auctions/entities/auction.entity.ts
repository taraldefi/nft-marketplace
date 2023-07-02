import { Allow } from 'class-validator';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import {
  Column,
  Entity,
  OneToMany,
} from 'typeorm';
import { AuctionStatus } from './auction.status';
import { AuctionBidEntity } from './auction.bid.entity';

@Entity({ name: 'Auctions' })
export class AuctionEntity extends CustomBaseEntity {
  @Column()
  @Allow()
  auctionId: number;

  @Column()
  @Allow()
  endBlock: string;

  @Column()
  @Allow()
  highestBid: string;

  nftAsset: string;

  highestBidder: string;

  @Column({
      type: "enum",
      enum: AuctionStatus,
      default: AuctionStatus.OPEN
  })
  status: AuctionStatus;

  @OneToMany(
    () => AuctionBidEntity,
    (auctionBidEntity) => auctionBidEntity.auction,
  )
  bids: AuctionBidEntity[];
}

