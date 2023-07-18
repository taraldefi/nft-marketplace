import { Allow } from "class-validator";
import { CustomBaseEntity } from "src/common/entity/custom-base.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { AuctionEntity } from "./auction.entity";

@Entity({ name: 'Bids' })
export class AuctionBidEntity extends CustomBaseEntity {

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    @Allow()
    amount: number;

    @Column()
    @Allow()
    bidder: string;

    @ManyToOne(() => AuctionEntity, {
        eager: true,
        cascade: true,
        onDelete: 'CASCADE',
    })
    auction: AuctionEntity;
}