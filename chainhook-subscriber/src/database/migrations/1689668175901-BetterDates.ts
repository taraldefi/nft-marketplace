import {MigrationInterface, QueryRunner} from "typeorm";

export class BetterDates1689668175901 implements MigrationInterface {
    name = 'BetterDates1689668175901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction_bids_history" ADD "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
        await queryRunner.query(`ALTER TABLE "auctions_history" ADD "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "createdAt" SET DEFAULT ('now'::text)::timestamp(3) with time zone`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "updatedAt" SET DEFAULT ('now'::text)::timestamp(3) with time zone`);
        await queryRunner.query(`ALTER TABLE "Bids" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE "Bids" ALTER COLUMN "createdAt" SET DEFAULT ('now'::text)::timestamp(3) with time zone`);
        await queryRunner.query(`ALTER TABLE "Bids" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE "Bids" ALTER COLUMN "updatedAt" SET DEFAULT ('now'::text)::timestamp(3) with time zone`);
        await queryRunner.query(`ALTER TABLE "auction_bids_history" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE "auction_bids_history" ALTER COLUMN "createdAt" SET DEFAULT ('now'::text)::timestamp(3) with time zone`);
        await queryRunner.query(`ALTER TABLE "auctions_history" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`);
        await queryRunner.query(`ALTER TABLE "auctions_history" ALTER COLUMN "createdAt" SET DEFAULT ('now'::text)::timestamp(3) with time zone`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions_history" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auctions_history" ALTER COLUMN "createdAt" TYPE TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "auction_bids_history" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auction_bids_history" ALTER COLUMN "createdAt" TYPE TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "Bids" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "Bids" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "Bids" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "Bids" ALTER COLUMN "createdAt" TYPE TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "createdAt" TYPE TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE "auctions_history" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "auction_bids_history" DROP COLUMN "updatedAt"`);
    }

}
