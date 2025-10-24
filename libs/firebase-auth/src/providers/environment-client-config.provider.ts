import { Injectable } from '@nestjs/common';
import { FirebaseClientConfigProvider } from './firebase-client-config-provider.abstract';
import type { FirebaseClientConfig } from '../interfaces/firebase-client-config.interface';

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
