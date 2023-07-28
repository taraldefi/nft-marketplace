import {MigrationInterface, QueryRunner} from "typeorm";

export class Hash1690548214447 implements MigrationInterface {
    name = 'Hash1690548214447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Auctions" ADD "hash" character(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Bids" ADD "hash" character(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auction_bids_history" ADD "hash" character(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auctions_history" ADD "hash" character(64) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions_history" DROP COLUMN "hash"`);
        await queryRunner.query(`ALTER TABLE "auction_bids_history" DROP COLUMN "hash"`);
        await queryRunner.query(`ALTER TABLE "Bids" DROP COLUMN "hash"`);
        await queryRunner.query(`ALTER TABLE "Auctions" DROP COLUMN "hash"`);
    }

}
