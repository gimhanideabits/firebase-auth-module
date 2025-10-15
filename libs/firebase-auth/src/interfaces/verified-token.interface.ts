export interface VerifiedToken {
  uid: string;
  email?: string;
  emailVerified?: boolean;
  customClaims?: Record<string, unknown>;
  scopes?: string[];
}
