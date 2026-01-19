import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EvalProxyController } from './eval-proxy.controller';

@Module({
  imports: [ConfigModule],
  controllers: [
    EvalProxyController, // Proxy controller with guards for authentication
  ],
})
export class EvalControllerModule {}
