import {MigrationInterface, QueryRunner} from "typeorm";

export class Entities1689343471464 implements MigrationInterface {
    name = 'Entities1689343471464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."auctions_history_status_enum" AS ENUM('FINALIZED', 'OPEN', 'CLOSED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "auctions_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "changes" json NOT NULL DEFAULT '{}', "auctionId" integer NOT NULL, "endBlock" character varying NOT NULL, "highestBid" character varying NOT NULL, "nftAsset" character varying NOT NULL, "highestBidder" character varying NOT NULL, "status" "public"."auctions_history_status_enum" NOT NULL DEFAULT 'OPEN', CONSTRAINT "CHK_058da0f8f89bebc2b50711eb2c" CHECK ("action" IN ('insert', 'update', 'delete')), CONSTRAINT "PK_1d0cde049207d87cc40487680fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auction_bids_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "changes" json NOT NULL DEFAULT '{}', "auctionId" integer NOT NULL, "amount" numeric(10,2) NOT NULL DEFAULT '0', "bidder" character varying NOT NULL, CONSTRAINT "CHK_6c4e750761fe8516e09a77b04e" CHECK ("action" IN ('insert', 'update', 'delete')), CONSTRAINT "PK_d8cefa4fe1dd8bf6fe48d2c70de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Auctions" ADD "nftAsset" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Auctions" ADD "highestBidder" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Auctions" DROP COLUMN "highestBidder"`);
        await queryRunner.query(`ALTER TABLE "Auctions" DROP COLUMN "nftAsset"`);
        await queryRunner.query(`DROP TABLE "auction_bids_history"`);
        await queryRunner.query(`DROP TABLE "auctions_history"`);
        await queryRunner.query(`DROP TYPE "public"."auctions_history_status_enum"`);
    }

}
