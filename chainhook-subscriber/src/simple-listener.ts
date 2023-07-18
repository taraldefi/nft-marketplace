import * as amqp from 'amqplib';

const queueName = 'chainhook_queue';

export async function start() {
  try {
    console.log('In start function of simple-listener');
    const connection = await amqp.connect('amqp://admin:supersecretpassword@localhost:5673');
    console.log('`Connected to RabbitMQ server`');
    const channel = await connection.createChannel();

    console.log('`Created channel`');
    
    await channel.assertQueue(queueName, { durable: false });

    console.log(`Waiting for messages in ${queueName}. To exit press CTRL+C`);

    channel.consume(queueName, (msg) => {
      if (msg) {
        console.log(`Received message: ${msg.content.toString()}`);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error(`Error occurred: ${err}`);
  }
}