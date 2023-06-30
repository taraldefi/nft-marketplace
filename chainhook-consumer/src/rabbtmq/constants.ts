import { Transport } from "@nestjs/microservices";

export const RabbitMQService = 'RABBITMQ_SERVICE';

export const rabbitMQServiceOptions = {
    name: RabbitMQService,
    transport: Transport.RMQ,
    options: {
        urls: ['amqp://localhost:5672'],
        queue: 'chainhook_queue',
        queueOptions: {
            durable: false,
        },
    },
};