import {MigrationInterface, QueryRunner} from "typeorm";

export class Create1689625019371 implements MigrationInterface {
    name = 'Create1689625019371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Auctions" ADD "maker" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auctions_history" ADD "maker" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "highestBid" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "highestBidder" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auctions_history" ALTER COLUMN "highestBid" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auctions_history" ALTER COLUMN "highestBidder" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions_history" ALTER COLUMN "highestBidder" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auctions_history" ALTER COLUMN "highestBid" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "highestBidder" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Auctions" ALTER COLUMN "highestBid" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auctions_history" DROP COLUMN "maker"`);
        await queryRunner.query(`ALTER TABLE "Auctions" DROP COLUMN "maker"`);
    }

}
