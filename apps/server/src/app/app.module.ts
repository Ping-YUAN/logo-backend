import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogoBackendGateway } from './logo-backend.gateway';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import express from 'express';
import path from 'path';
import { LogoBackendService } from './logo-backend.service';
@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, LogoBackendGateway, LogoBackendService],
})
export class AppModule {
  static async createApp() {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new WsAdapter(app));
    app.enableCors();
    app.use(express.static(path.join(__dirname, '../logo-backend')));

    await app.listen(3000);
  }
}
