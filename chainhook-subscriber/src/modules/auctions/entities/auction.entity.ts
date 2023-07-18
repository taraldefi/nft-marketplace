import { Allow } from 'class-validator';
import { CustomBaseEntity } from 'src/common/entity/custom-base.entity';
import {
  Column,
  Entity,
  JoinTable,
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

  @Column({
    nullable: true,
  })
  @Allow()
  highestBid: string;

  @Column()
  @Allow()
  maker: string;

  @Column()
  @Allow()
  nftAsset: string;

  @Column({
    nullable: true,
  })
  @Allow()
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

