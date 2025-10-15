import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FirebaseAuthModule } from '@app/firebase-auth';

@Module({
  imports: [FirebaseAuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
