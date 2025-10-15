export interface CustomTokenOptions {
  uid: string;
  customClaims?: Record<string, unknown>;
  expiresIn?: number;
}
