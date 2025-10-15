import { FirebaseAuthService } from '../services/firebase-auth.service';
import { FirebaseCredentialsProvider, StaticCredentialsProvider, EnvironmentCredentialsProvider } from '../providers';
import type { FirebaseCredentials } from '../interfaces';

export class FirebaseAuthPlugin {
  private service: FirebaseAuthService;

  constructor(credentialsProvider: FirebaseCredentialsProvider) {
    this.service = new FirebaseAuthService(credentialsProvider);
  }

  static create(credentials: FirebaseCredentials): FirebaseAuthPlugin {
    const provider = new StaticCredentialsProvider(credentials);
    return new FirebaseAuthPlugin(provider);
  }

  static createFromEnvironment(): FirebaseAuthPlugin {
    const provider = new EnvironmentCredentialsProvider();
    return new FirebaseAuthPlugin(provider);
  }

  static createWithProvider(provider: FirebaseCredentialsProvider): FirebaseAuthPlugin {
    return new FirebaseAuthPlugin(provider);
  }

  async initialize(): Promise<void> {
    await this.service.onModuleInit();
  }

  getService(): FirebaseAuthService {
    return this.service;
  }
}
