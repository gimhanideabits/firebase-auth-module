import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FirebaseAuthModule } from '@app/firebase-auth';
import { DomainConfigService } from '../config/domain-config.service';
import { CustomJwtService } from '../services/custom-jwt.service';

@Module({
  imports: [FirebaseAuthModule],
  controllers: [UserController],
  providers: [UserService, DomainConfigService, CustomJwtService],
})
export class UserModule {}
