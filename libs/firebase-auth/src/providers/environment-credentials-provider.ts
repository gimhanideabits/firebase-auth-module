import { Injectable } from '@nestjs/common';
import { FirebaseCredentialsProvider } from './firebase-credentials-provider.abstract';
import type { FirebaseCredentials } from '../interfaces';

@Injectable()
export class EnvironmentCredentialsProvider extends FirebaseCredentialsProvider {
  async getCredentials(): Promise<FirebaseCredentials> {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const webApiKey = process.env.FIREBASE_WEB_API_KEY;

    if (!projectId || !privateKey || !clientEmail || !webApiKey) {
      throw new Error('Missing required Firebase environment variables');
    }

    return {
      serviceAccount: {
        projectId,
        privateKey,
        clientEmail,
      },
      webApiKey,
    };
  }
}
