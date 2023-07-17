import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import * as amqp from 'amqplib';
import * as winston from 'winston';
import { Counter, Registry } from 'prom-client';
import { StartAuctionService } from './start.auction.service';
import { CancelAuctionService } from './cancel.auction.service';
import { PlaceBidService } from './place.bid.service';
import { CancelAuction, PlaceBid, StartAuction } from 'src/models';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnApplicationShutdown {
    private queueName = 'chainhook_queue';
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
    private consuming = false;

    private registry = new Registry();
    private successfulConnectionCounter = new Counter({
        name: 'rabbitmq_successful_connections_total',
        help: 'Total number of successful connections to RabbitMQ',
        registers: [this.registry],
    });
    private connectionErrorCounter = new Counter({
        name: 'rabbitmq_connection_errors_total',
        help: 'Total number of connection errors to RabbitMQ',
        registers: [this.registry],
    });

    private logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: 'error.log', level: 'error' }),
        ],
    });

    public constructor(
        private readonly startAuctionService: StartAuctionService,
        private readonly cancelAuctionService: CancelAuctionService,
        private readonly placeBidService: PlaceBidService,
    ) {

    }

    async onModuleInit() {
        await this.retryConnect();
        await this.startListening();
    }

    async onApplicationShutdown() {
        await this.stopListening();
        await this.closeConnection();
    }

    private async connect() {
        try {
            this.connection = await amqp.connect('amqp://admin:supersecretpassword@localhost:5673');
            this.connection.on('error', (err) => {
                this.logger.error(`Connection error: ${err}`);
                this.connection = null;
                this.connectionErrorCounter.inc();
            });
            this.connection.on('close', () => {
                this.logger.info(`Connection closed`);
                this.connection = null;
            });
            this.successfulConnectionCounter.inc();
        } catch (err) {
            this.logger.error(`Failed to connect: ${err}`);
            this.connectionErrorCounter.inc();
        }
    }

    private async createChannel() {
        if (!this.connection) {
            this.logger.error(`Cannot create a channel without a connection`);
            return;
        }

        try {
            this.channel = await this.connection.createChannel();
            this.channel.on('error', (err) => {
                this.logger.error(`Channel error: ${err}`);
                this.channel = null;
            });
            this.channel.on('close', () => {
                this.logger.info(`Channel closed`);
                this.channel = null;
            });
        } catch (err) {
            this.logger.error(`Failed to create a channel: ${err}`);
        }
    }

    private async retryConnect() {
        let retries = 0;

        while (!this.connection && retries < 5) {
            try {
                this.logger.info(`Attempting to connect (Attempt ${retries + 1})...`);
                await this.connect();
            } catch (err) {
                this.logger.error(`Failed to connect: ${err}`);
            }

            if (!this.connection) {
                const timeout = Math.pow(2, retries) * 1000;
                await new Promise((resolve) => setTimeout(resolve, timeout));
            }

            retries++;
        }

        if (!this.connection) {
            this.logger.error(`Failed to connect after retries`);
        }
    }

    async startListening() {
        if (!this.channel) {
            await this.createChannel();
        }

        if (this.channel) {
            await this.channel.assertQueue(this.queueName, { durable: false });

            this.channel.consume(this.queueName, async (msg) => {
                if (msg) {

                    const content = msg.content.toString();
                    const json = JSON.parse(content);
                    const { data } = json;
                    const dataJson = JSON.parse(data);

                    let type = dataJson.action.value as string;

                    switch (type) {
                        case 'place-bid':
                            this.logger.info('Place bid event received');
                            const placeBidModel = dataJson as PlaceBid;
                            await this.placeBidService.placeBid(placeBidModel);
                            break;
                        case 'place-bid-return-previous-bid':
                            this.logger.info('Place bid return previous bid event received');
                            break;
                        case 'start-auction':
                            this.logger.info('Start Auction event received');

                            const startAuctionModel = dataJson as StartAuction;
                            await this.startAuctionService.startAuction(startAuctionModel);
                            break;
                        case 'set-whitelisted':
                            this.logger.info('Whitelist event received');
                            break;
                        case 'cancel-auction': 
                            this.logger.info('Cancel Auction event received');
                            const cancelAuctionModel = dataJson as CancelAuction;
                            await this.cancelAuctionService.cancelAuction(cancelAuctionModel);
                            break;
                        default:
                            this.logger.info('Unknown event received');
                            break;
                    }

                    this.channel?.ack(msg);
                }
            });

            this.consuming = true;
            this.logger.info(`Started listening to ${this.queueName}`);
        }
    }

    async stopListening() {
        if (this.channel && this.consuming) {
            await this.channel.cancel(this.queueName);
            this.consuming = false;
            this.logger.info(`Stopped listening to ${this.queueName}`);
        }
    }

    private async closeConnection() {
        if (this.connection) {
            await this.connection.close();
            this.logger.info(`Connection to RabbitMQ closed`);
        }
    }

    getMetrics() {
        return this.registry.metrics();
    }
}
