import { Injectable } from '@nestjs/common';
import { FirebaseAuthService } from '@app/firebase-auth';
import { CustomTokenExchangeError } from '../errors/auth.errors';
import { TokenExchangeResult } from '../dto/session.dto';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, Auth } from 'firebase/auth';
import { EnvironmentClientConfigProvider } from '@app/firebase-auth';

@Injectable()
export class TokenExchangeService {
  private firebaseApp: FirebaseApp | null = null;
  private auth: Auth | null = null;

  constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly clientConfigProvider: EnvironmentClientConfigProvider
  ) {}

  async exchangeCustomToken(customToken: string): Promise<TokenExchangeResult> {
    try {
      await this.initializeFirebaseClient();
      
      const userCredential = await signInWithCustomToken(this.auth!, customToken);
      const user = userCredential.user;
      
   
      const idToken = await user.getIdToken();
      
     
      const refreshToken = (userCredential as any)._tokenResponse?.refreshToken || '';
      
    
      const idTokenResult = await user.getIdTokenResult();
      const expiresIn = Math.floor((new Date(idTokenResult.expirationTime).getTime() - Date.now()) / 1000);
      
      return {
        idToken,
        refreshToken,
        expiresIn: expiresIn > 0 ? expiresIn : 3600, 
      };
    } catch (error: any) {
      throw new CustomTokenExchangeError(
        `Firebase rejected custom token: ${error.message}`,
        error
      );
    }
  }

  private async initializeFirebaseClient(): Promise<void> {
    if (this.firebaseApp && this.auth) {
      return; // Already initialized
    }

    try {
      const firebaseConfig = await this.clientConfigProvider.getClientConfig();

      // Initialize Firebase app if not already initialized
      if (getApps().length === 0) {
        this.firebaseApp = initializeApp(firebaseConfig);
      } else {
        this.firebaseApp = getApps()[0];
      }

      this.auth = getAuth(this.firebaseApp);
    } catch (error) {
      throw new CustomTokenExchangeError(
        'Failed to initialize Firebase client',
        error as Error
      );
    }
  }
}
