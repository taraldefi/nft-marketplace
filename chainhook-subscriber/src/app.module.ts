import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { AuctionModule } from './modules/auctions/auction.module';
import { AuctionHistoryModule } from './modules/auctionhistory/auction.history.module';
import { ClientsModule } from '@nestjs/microservices';
import { rabbitMQServiceOptions } from './common/rabbitmq/constants';

@Module({
  imports: [
    ClientsModule.register([
      rabbitMQServiceOptions as any
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        appConfig
      ],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    AuctionModule,
    AuctionHistoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
