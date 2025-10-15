import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { FirebaseAuthModule, EnvironmentCredentialsProvider } from '@app/firebase-auth';

@Module({
  imports: [
    FirebaseAuthModule.forRoot({
      credentialsProvider: new EnvironmentCredentialsProvider(),
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
