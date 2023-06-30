import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQService } from './constants';

@Injectable()
export class AuctionPublisherService {
    constructor(
        @Inject(RabbitMQService)
        private client: ClientProxy,
    ) {}

    async publishMessage(pattern: string, message: string): Promise<void> {

        console.log(`Publishing message: ${message}`);
        console.log('Publishing message to pattern: ' + pattern);

        await this.client.emit(pattern, message).toPromise().catch(err => {
            console.error(`Error while emitting message: ${JSON.stringify(err)}`);
          });;
    }
}