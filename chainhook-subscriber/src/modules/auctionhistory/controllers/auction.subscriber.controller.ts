import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class AuctionSubscriberController {
    @EventPattern('auction_event')
    async handleMessage(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        
        console.log(`Received message: ${JSON.stringify(data)}`);

        // Processing of message...

        // Acknowledge the message
        channel.ack(originalMsg);
    }
}
