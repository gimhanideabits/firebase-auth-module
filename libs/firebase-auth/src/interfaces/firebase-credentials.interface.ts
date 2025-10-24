export interface FirebaseCredentials {
  serviceAccount: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };
  webApiKey: string;
  messagingSenderId?: string;
  appId?: string;
}
