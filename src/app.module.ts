import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CustomJwtAuthModule, GlobalErrorFilter } from './custom_jwt_auth';
import { FirebaseAuthModule, EnvironmentCredentialsProvider } from '@app/firebase-auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseAuthModule.forRoot({
      credentialsProvider: new EnvironmentCredentialsProvider(),
    }),
    UserModule,
    CustomJwtAuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalErrorFilter,
    },
  ],
})
export class AppModule {}
