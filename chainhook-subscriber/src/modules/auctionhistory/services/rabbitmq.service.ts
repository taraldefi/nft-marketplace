import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import * as amqp from 'amqplib';
import * as winston from 'winston';
import * as promClient from 'prom-client';
import * as retry from 'retry';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnApplicationShutdown {
  private queueName = 'chainhook_queue';
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private consuming = false;

  private retryOptions: retry.OperationOptions = {
    retries: 5, // Number of retries
    factor: 2, // Exponential backoff factor
    minTimeout: 1000, // Minimum timeout in milliseconds
    maxTimeout: 60000, // Maximum timeout in milliseconds
    randomize: true, // Randomize the timeouts slightly
  };
  private retryOperation: retry.RetryOperation;

  private messageCounter = new promClient.Counter({
    name: 'rabbitmq_messages_received',
    help: 'Total number of messages received from RabbitMQ',
  });

  private logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
  });

  constructor() {
    promClient.collectDefaultMetrics();
  }

  async onModuleInit() {
    this.retryOperation = retry.operation(this.retryOptions);
    await this.connect();
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
        this.retryConnect();
      });
      this.connection.on('close', () => {
        this.logger.info(`Connection closed`);
        this.connection = null;
        this.retryConnect();
      });
    } catch (err) {
      this.logger.error(`Failed to connect: ${err}`);
      this.retryConnect();
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
    this.retryOperation.retry((retryCb: (error: Error | null, result?: any) => void) => {
      if (!this.connection) {
        this.logger.info(`Attempting to reconnect...`);
        this.connect()
          .then(() => retryCb(null, true))
          .catch((err) => retryCb(err, false));
      } else {
        retryCb(null, false);
      }
    }, (err: Error | null) => {
      if (err) {
        this.logger.error(`Failed to connect after retries: ${err}`);
      }
    });
  }

  async startListening() {
    if (!this.channel) {
      await this.createChannel();
    }

    if (this.channel) {
      await this.channel.assertQueue(this.queueName, { durable: false });

      this.channel.consume(this.queueName, (msg) => {
        if (msg) {
          this.logger.info(`Received message: ${msg.content.toString()}`);
          this.messageCounter.inc();
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
    return promClient.register.metrics();
  }
}
