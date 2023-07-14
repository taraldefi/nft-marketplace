import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class AuctionSubscriberController {
    @EventPattern('auction_event')
    async handleMessage(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        let type = data.type.value as string;

        switch (type) {
            case 'place-bid':
                console.log('Place bid event received');
                break;
            case 'start-auction':
                console.log('Start Auction event received');
                break;
            case 'set-whitelisted':
                console.log('Whitelist event received');
                break;
            case 'cancel-auction': 
                console.log('Cancel Auction event received');
                break;
            default:
                console.log('Unknown event received');
                break;
        }

        // Acknowledge the message
        channel.ack(originalMsg);
    }
}
