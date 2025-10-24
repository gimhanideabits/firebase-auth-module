import { Injectable } from '@nestjs/common';
import { FirebaseCredentialsProvider } from './firebase-credentials-provider.abstract';
import type { FirebaseCredentials } from '../interfaces';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId?: string;
  appId?: string;
}

export abstract class FirebaseClientConfigProvider {
  abstract getClientConfig(): Promise<FirebaseClientConfig>;
}

@Injectable()
export class EnvironmentClientConfigProvider extends FirebaseClientConfigProvider {
  async getClientConfig(): Promise<FirebaseClientConfig> {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const webApiKey = process.env.FIREBASE_WEB_API_KEY;
    const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
    const appId = process.env.FIREBASE_APP_ID;

    if (!projectId || !webApiKey) {
      throw new Error('Missing required Firebase client environment variables');
    }

    return {
      apiKey: webApiKey,
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: `${projectId}.appspot.com`,
      messagingSenderId,
      appId,
    };
  }
}
