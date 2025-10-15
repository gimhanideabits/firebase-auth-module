// import { Test, TestingModule } from '@nestjs/testing';
// import { FirebaseAuthLibraryService } from './firebase-auth-library.service';
// import {
//   IFirebaseCredentialProvider,
//   FirebaseCredentials,
// } from './interfaces/credential-provider.interface';
// import {
//   InvalidArgumentError,
//   InsufficientScopeError,
// } from './errors/firebase-auth.errors';

// /**
//  * Mock credential provider for testing
//  */
// class MockCredentialProvider implements IFirebaseCredentialProvider {
//   getCredentials(): FirebaseCredentials {
//     return {
//       serviceAccount: {
//         type: 'service_account',
//         project_id: 'test-project',
//         private_key_id: 'test-key-id',
//         private_key:
//           '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
//         client_email: 'test@test-project.iam.gserviceaccount.com',
//         client_id: 'test-client-id',
//         auth_uri: 'https://accounts.google.com/o/oauth2/auth',
//         token_uri: 'https://oauth2.googleapis.com/token',
//         auth_provider_x509_cert_url:
//           'https://www.googleapis.com/oauth2/v1/certs',
//         client_x509_cert_url: 'https://www.googleapis.com/test',
//       },
//       webApiKey: 'test-api-key',
//     };
//   }
// }

// describe('FirebaseAuthLibraryService', () => {
//   let service: FirebaseAuthLibraryService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         FirebaseAuthLibraryService,
//         {
//           provide: 'FIREBASE_CREDENTIAL_PROVIDER',
//           useClass: MockCredentialProvider,
//         },
//       ],
//     }).compile();

//     service = module.get<FirebaseAuthLibraryService>(
//       FirebaseAuthLibraryService,
//     );
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('Scope Verification', () => {
//     describe('validateScopes (testing logic indirectly)', () => {
//       it('should validate when all required scopes are present', () => {
//         const actualScopes = ['admin', 'user', 'editor'];
//         const requiredScopes = ['admin', 'user'];

//         const allPresent = requiredScopes.every((req) =>
//           actualScopes.includes(req),
//         );
//         expect(allPresent).toBe(true);
//       });

//       it('should fail when required scope is missing', () => {
//         const actualScopes = ['user', 'editor'];
//         const requiredScopes = ['admin', 'user'];

//         const allPresent = requiredScopes.every((req) =>
//           actualScopes.includes(req),
//         );
//         expect(allPresent).toBe(false);
//       });

//       it('should succeed when no scopes are required', () => {
//         const actualScopes = ['user'];
//         const requiredScopes: string[] = [];

//         const allPresent = requiredScopes.every((req) =>
//           actualScopes.includes(req),
//         );
//         expect(allPresent).toBe(true);
//       });

//       it('should be case-sensitive', () => {
//         const actualScopes = ['Admin', 'User'];
//         const requiredScopes = ['admin', 'user'];

//         const allPresent = requiredScopes.every((req) =>
//           actualScopes.includes(req),
//         );
//         expect(allPresent).toBe(false);
//       });

//       it('should handle exact string matching', () => {
//         const actualScopes = ['admin-read', 'user-write'];
//         const requiredScopes = ['admin'];

//         const allPresent = requiredScopes.every((req) =>
//           actualScopes.includes(req),
//         );
//         expect(allPresent).toBe(false);
//       });

//       it('should work with empty actual scopes', () => {
//         const actualScopes: string[] = [];
//         const requiredScopes = ['admin'];

//         const allPresent = requiredScopes.every((req) =>
//           actualScopes.includes(req),
//         );
//         expect(allPresent).toBe(false);
//       });

//       it('should work with duplicate scopes', () => {
//         const actualScopes = ['admin', 'admin', 'user'];
//         const requiredScopes = ['admin', 'user'];

//         const allPresent = requiredScopes.every((req) =>
//           actualScopes.includes(req),
//         );
//         expect(allPresent).toBe(true);
//       });

//       it('should handle special characters in scope names', () => {
//         const actualScopes = ['admin:read', 'user:write', 'data.export'];
//         const requiredScopes = ['admin:read', 'data.export'];

//         const allPresent = requiredScopes.every((req) =>
//           actualScopes.includes(req),
//         );
//         expect(allPresent).toBe(true);
//       });
//     });

//     describe('InsufficientScopeError', () => {
//       it('should contain required and actual scopes', () => {
//         const requiredScopes = ['admin', 'user'];
//         const actualScopes = ['user'];

//         const error = new InsufficientScopeError(
//           'Scopes not met',
//           requiredScopes,
//           actualScopes,
//         );

//         expect(error).toBeInstanceOf(InsufficientScopeError);
//         expect(error.code).toBe('INSUFFICIENT_SCOPE');
//         expect(error.requiredScopes).toEqual(requiredScopes);
//         expect(error.actualScopes).toEqual(actualScopes);
//       });
//     });
//   });

//   describe('Validation', () => {
//     describe('createUser validation', () => {
//       it('should reject invalid email', async () => {
//         await expect(
//           service.createUser({
//             email: 'not-an-email',
//             password: 'password123',
//           }),
//         ).rejects.toThrow(InvalidArgumentError);
//       });

//       it('should reject short password', async () => {
//         await expect(
//           service.createUser({
//             email: 'test@example.com',
//             password: '12345',
//           }),
//         ).rejects.toThrow(InvalidArgumentError);
//       });

//       it('should reject non-array scopes', async () => {
//         await expect(
//           service.createUser({
//             email: 'test@example.com',
//             password: 'password123',
//             scopes: 'admin' as any,
//           }),
//         ).rejects.toThrow(InvalidArgumentError);
//       });
//     });

//     describe('verifyIdToken validation', () => {
//       it('should reject empty token', async () => {
//         await expect(service.verifyIdToken('')).rejects.toThrow(
//           InvalidArgumentError,
//         );
//       });

//       it('should reject non-string token', async () => {
//         await expect(service.verifyIdToken(null as any)).rejects.toThrow(
//           InvalidArgumentError,
//         );
//       });
//     });

//     describe('createCustomToken validation', () => {
//       it('should reject empty uid', async () => {
//         await expect(service.createCustomToken('')).rejects.toThrow(
//           InvalidArgumentError,
//         );
//       });
//     });

//     describe('refreshToken validation', () => {
//       it('should reject empty refresh token', async () => {
//         await expect(
//           service.refreshToken({ refreshToken: '' }),
//         ).rejects.toThrow(InvalidArgumentError);
//       });
//     });

//     describe('getUserByEmail validation', () => {
//       it('should reject invalid email', async () => {
//         await expect(service.getUserByEmail('not-an-email')).rejects.toThrow(
//           InvalidArgumentError,
//         );
//       });
//     });

//     describe('updateUserScopes validation', () => {
//       it('should reject empty uid', async () => {
//         await expect(service.updateUserScopes('', ['admin'])).rejects.toThrow(
//           InvalidArgumentError,
//         );
//       });

//       it('should reject non-array scopes', async () => {
//         await expect(
//           service.updateUserScopes('uid123', 'admin' as any),
//         ).rejects.toThrow(InvalidArgumentError);
//       });
//     });
//   });

//   describe('Scope Matching Rules Documentation', () => {
//     it('should document scope matching rules', () => {
//       // Rule 1: Exact match required
//       expect(['admin'].includes('admin')).toBe(true);
//       expect(['admin'].includes('Admin')).toBe(false);

//       // Rule 2: Case-sensitive
//       expect(['admin'].includes('admin')).toBe(true);
//       expect(['admin'].includes('ADMIN')).toBe(false);

//       // Rule 3: No partial matching
//       expect(['admin-read'].includes('admin')).toBe(false);

//       // Rule 4: All required must be present
//       const actualScopes = ['admin', 'user'];
//       const requiredScopes = ['admin', 'user', 'editor'];
//       expect(requiredScopes.every((r) => actualScopes.includes(r))).toBe(false);

//       // Rule 5: Order doesn't matter
//       expect(['b', 'a', 'c'].includes('a')).toBe(true);

//       // Rule 6: Empty required = always valid
//       expect([].every((r) => ['admin'].includes(r))).toBe(true);

//       // Rule 7: Empty actual with required = invalid
//       expect(['admin'].every((r) => [].includes(r))).toBe(false);
//     });
//   });
// });
