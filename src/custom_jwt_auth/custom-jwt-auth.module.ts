import { Module } from '@nestjs/common';
import { SessionsController } from './controllers/sessions.controller';
import { TokenExchangeService } from './services/token-exchange.service';
import { FirebaseAuthModule, EnvironmentCredentialsProvider, EnvironmentClientConfigProvider } from '@app/firebase-auth';

@Module({
  imports: [FirebaseAuthModule],
  controllers: [SessionsController],
  providers: [
    TokenExchangeService,
    EnvironmentClientConfigProvider,
  ],
})
export class CustomJwtAuthModule {}
