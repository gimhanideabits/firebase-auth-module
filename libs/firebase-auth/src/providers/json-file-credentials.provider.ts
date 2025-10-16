import { Injectable } from '@nestjs/common';
import { FirebaseCredentialsProvider } from './firebase-credentials-provider.abstract';
import type { FirebaseCredentials } from '../interfaces';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JsonFileCredentialsProvider extends FirebaseCredentialsProvider {
  async getCredentials(): Promise<FirebaseCredentials> {
    try {
      const jsonPath = path.join(process.cwd(), 'firebase-service-account.json');
      const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      return {
        serviceAccount: {
          projectId: serviceAccount.project_id,
          privateKey: serviceAccount.private_key,
          clientEmail: serviceAccount.client_email,
        },
        webApiKey: process.env.FIREBASE_WEB_API_KEY!,
      };
    } catch (error) {
      throw new Error('Failed to read Firebase service account JSON file');
    }
  }
}
