export interface UserCreationData {
  email: string;
  password: string;
  displayName?: string;
  customClaims?: Record<string, unknown>;
}
