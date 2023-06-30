import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiKeyAuthGuard } from './auth/guard/apikey-auth.guard';

@UseGuards(ApiKeyAuthGuard)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  
  @Post('chainhook')
  chainhook(@Body() body: any): void {
    console.log(JSON.stringify(body));
  }
}
