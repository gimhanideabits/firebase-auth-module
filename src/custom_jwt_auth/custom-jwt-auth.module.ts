import { Module } from '@nestjs/common';
import { SessionsController } from './controllers/sessions.controller';
import { RefreshTokenController } from './controllers/refresh-token.controller';
import { TokenExchangeService } from './services/token-exchange.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { FirebaseAuthModule, EnvironmentCredentialsProvider, EnvironmentClientConfigProvider } from '@app/firebase-auth';

@Module({
  imports: [FirebaseAuthModule],
  controllers: [SessionsController, RefreshTokenController],
  providers: [
    TokenExchangeService,
    RefreshTokenService,
    EnvironmentClientConfigProvider,
  ],
})
export class CustomJwtAuthModule {}
