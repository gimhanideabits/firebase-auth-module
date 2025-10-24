import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

export class SwaggerConfig {
  static createDocumentBuilder(): DocumentBuilder {
    return new DocumentBuilder()
      .setTitle('Firebase Auth Module API')
      .setDescription(`
        A comprehensive authentication API built with NestJS and Firebase.
        
        ## Features
        - Firebase custom token exchange
        - Secure HttpOnly cookie management
        - User authentication and management
        - Token validation and refresh
        
        ## Authentication Flow
        1. Client sends Firebase custom token to \`POST /auth/sessions\`
        2. Server validates and exchanges token for ID and refresh tokens
        3. Server sets HttpOnly cookies with tokens
        4. Client uses cookies for subsequent authenticated requests
        
        ## Security
        - All tokens are stored in HttpOnly cookies
        - Secure cookie flags enabled in production
        - SameSite=Strict for CSRF protection
        - Refresh tokens scoped to specific paths
      `)
      .setVersion('1.0.0')
      .addTag('Authentication', 'Firebase authentication and session management')
      .addTag('Users', 'User management operations')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addCookieAuth('id_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'id_token',
        description: 'Firebase ID token stored in HttpOnly cookie',
      })
      .addCookieAuth('refresh_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'refresh_token',
        description: 'Firebase refresh token stored in HttpOnly cookie',
      })
      .addServer('http://localhost:5002', 'Development server')
      .addServer('https://api.gettsted.com', 'Production server');
  }

  static getSwaggerOptions(): SwaggerDocumentOptions {
    return {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      deepScanRoutes: true,
    };
  }

  static getSwaggerUIOptions() {
    return {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        requestInterceptor: (req: any) => {
          // Add any custom request interceptor logic here
          return req;
        },
        responseInterceptor: (res: any) => {
          // Add any custom response interceptor logic here
          return res;
        },
      },
      customSiteTitle: 'Firebase Auth API Documentation',
      customfavIcon: 'https://firebase.google.com/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
        .swagger-ui .info .title { color: #ff6b35 }
        .swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .swagger-ui .auth-container { background: #e3f2fd; padding: 10px; border-radius: 4px; margin: 10px 0; }
        .swagger-ui .auth-btn-wrapper { margin: 5px 0; }
        .swagger-ui .auth-btn { background: #ff6b35; border-color: #ff6b35; }
        .swagger-ui .auth-btn:hover { background: #e55a2b; border-color: #e55a2b; }
      `,
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
    };
  }

  static getApiInfo() {
    return {
      title: 'Firebase Auth Module API',
      description: 'A comprehensive authentication API built with NestJS and Firebase',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@gettsted.com',
        url: 'https://gettsted.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    };
  }

  static getSecuritySchemes() {
    return {
      'JWT-auth': {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for API authentication',
      },
      'id_token': {
        type: 'apiKey',
        in: 'cookie',
        name: 'id_token',
        description: 'Firebase ID token stored in HttpOnly cookie',
      },
      'refresh_token': {
        type: 'apiKey',
        in: 'cookie',
        name: 'refresh_token',
        description: 'Firebase refresh token stored in HttpOnly cookie',
      },
    };
  }

  static getTags() {
    return [
      {
        name: 'Authentication',
        description: 'Firebase authentication and session management endpoints',
      },
      {
        name: 'Users',
        description: 'User management and profile operations',
      },
      {
        name: 'Sessions',
        description: 'Session management and token operations',
      },
    ];
  }
}
