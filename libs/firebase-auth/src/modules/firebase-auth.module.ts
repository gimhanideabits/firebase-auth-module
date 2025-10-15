import { Module, DynamicModule } from '@nestjs/common';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { FirebaseCredentialsProvider } from '../providers';
import type { FirebaseCredentials } from '../interfaces';

export interface FirebaseAuthModuleOptions {
  credentialsProvider: FirebaseCredentialsProvider;
}

@Module({})
export class FirebaseAuthModule {
  static forRoot(options: FirebaseAuthModuleOptions): DynamicModule {
    return {
      module: FirebaseAuthModule,
      providers: [
        {
          provide: FirebaseCredentialsProvider,
          useValue: options.credentialsProvider,
        },
        FirebaseAuthService,
      ],
      exports: [FirebaseAuthService],
      global: true,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<FirebaseCredentialsProvider> | FirebaseCredentialsProvider;
    inject?: any[];
  }): DynamicModule {
    return {
      module: FirebaseAuthModule,
      providers: [
        {
          provide: FirebaseCredentialsProvider,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        FirebaseAuthService,
      ],
      exports: [FirebaseAuthService],
      global: true,
    };
  }
}
