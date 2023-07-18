import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1688316349291 implements MigrationInterface {
    name = 'InitialMigration1688316349291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Auctions_status_enum" AS ENUM('FINALIZED', 'OPEN', 'CLOSED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "Auctions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "auctionId" integer NOT NULL, "endBlock" character varying NOT NULL, "highestBid" character varying NOT NULL, "status" "public"."Auctions_status_enum" NOT NULL DEFAULT 'OPEN', CONSTRAINT "PK_cb157335b3d35a7144c48d123e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Bids" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "amount" numeric(10,2) NOT NULL DEFAULT '0', "bidder" character varying NOT NULL, "auctionId" uuid, CONSTRAINT "PK_c883ef5b8fbd0d953d39c3b7a7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Bids" ADD CONSTRAINT "FK_ed42474e4bfeee3269835924ff3" FOREIGN KEY ("auctionId") REFERENCES "Auctions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Bids" DROP CONSTRAINT "FK_ed42474e4bfeee3269835924ff3"`);
        await queryRunner.query(`DROP TABLE "Bids"`);
        await queryRunner.query(`DROP TABLE "Auctions"`);
        await queryRunner.query(`DROP TYPE "public"."Auctions_status_enum"`);
    }
}
