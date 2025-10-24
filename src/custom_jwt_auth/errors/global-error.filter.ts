import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { BaseError, AuthError, ValidationError } from './auth.errors';

export interface ErrorResponse {
  ok: false;
  message: string;
  errors: Array<{
    code: string;
    error: string;
  }>;
  metadata: {
    request_id: string;
    timestamp: string;
  };
}

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    let errorResponse: ErrorResponse;

    if (exception instanceof BaseError) {
      errorResponse = this.handleCustomError(exception, requestId, timestamp);
    } else if (exception instanceof HttpException) {
      errorResponse = this.handleHttpException(exception, requestId, timestamp);
    } else {
      errorResponse = this.handleUnknownError(exception, requestId, timestamp);
    }

    response.status(this.getStatusCode(errorResponse))
           .json(errorResponse);
  }

  private handleCustomError(error: BaseError, requestId: string, timestamp: string): ErrorResponse {
    return {
      ok: false,
      message: this.getErrorMessage(error),
      errors: [{
        code: error.code,
        error: error.message,
      }],
      metadata: {
        request_id: requestId,
        timestamp,
      },
    };
  }

  private handleHttpException(exception: HttpException, requestId: string, timestamp: string): ErrorResponse {
    const status = exception.getStatus();
    const response = exception.getResponse();

    return {
      ok: false,
      message: this.getHttpErrorMessage(status),
      errors: [{
        code: this.getHttpErrorCode(status),
        error: typeof response === 'string' ? response : (response as any).message || 'Unknown error',
      }],
      metadata: {
        request_id: requestId,
        timestamp,
      },
    };
  }

  private handleUnknownError(exception: unknown, requestId: string, timestamp: string): ErrorResponse {
    return {
      ok: false,
      message: 'An unexpected error occurred',
      errors: [{
        code: 'internal_server_error',
        error: 'An unexpected error occurred',
      }],
      metadata: {
        request_id: requestId,
        timestamp,
      },
    };
  }

  private getErrorMessage(error: BaseError): string {
    if (error instanceof AuthError) {
      return 'Authentication failed';
    }
    if (error instanceof ValidationError) {
      return 'Validation failed';
    }
    return 'An error occurred';
  }

  private getHttpErrorMessage(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not found';
      case HttpStatus.METHOD_NOT_ALLOWED:
        return 'Method not allowed';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Validation failed';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too many requests';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal server error';
      case HttpStatus.BAD_GATEWAY:
        return 'Bad gateway';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service unavailable';
      default:
        return 'An error occurred';
    }
  }

  private getHttpErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'bad_request';
      case HttpStatus.UNAUTHORIZED:
        return 'unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'forbidden';
      case HttpStatus.NOT_FOUND:
        return 'not_found';
      default:
        return 'internal_server_error';
    }
  }

  private getStatusCode(errorResponse: ErrorResponse): number {
    const errorCode = errorResponse.errors[0]?.code;
    
    // Custom error codes
    if (errorCode === 'custom_token_exchange_failed') {
      return HttpStatus.UNAUTHORIZED;
    }
    if (errorCode?.startsWith('invalid_') || errorCode?.startsWith('missing_')) {
      return HttpStatus.BAD_REQUEST;
    }
    
    // HTTP error codes
    switch (errorCode) {
      case 'bad_request':
        return HttpStatus.BAD_REQUEST;
      case 'unauthorized':
        return HttpStatus.UNAUTHORIZED;
      case 'forbidden':
        return HttpStatus.FORBIDDEN;
      case 'not_found':
        return HttpStatus.NOT_FOUND;
      case 'method_not_allowed':
        return HttpStatus.METHOD_NOT_ALLOWED;
      case 'conflict':
        return HttpStatus.CONFLICT;
      case 'validation_failed':
        return HttpStatus.UNPROCESSABLE_ENTITY;
      case 'too_many_requests':
        return HttpStatus.TOO_MANY_REQUESTS;
      case 'internal_server_error':
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case 'bad_gateway':
        return HttpStatus.BAD_GATEWAY;
      case 'service_unavailable':
        return HttpStatus.SERVICE_UNAVAILABLE;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private generateRequestId(): string {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
      const r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  }
}
