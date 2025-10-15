import { Injectable } from '@nestjs/common';
import { FirebaseCredentialsProvider } from './firebase-credentials-provider.abstract';
import type { FirebaseCredentials } from '../interfaces';

@Injectable()
export class StaticCredentialsProvider extends FirebaseCredentialsProvider {
  constructor(private readonly credentials: FirebaseCredentials) {
    super();
  }

  async getCredentials(): Promise<FirebaseCredentials> {
    return this.credentials;
  }
}
