import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Firebase custom token to exchange for ID and refresh tokens',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString({ message: 'Custom token must be a string' })
  @IsNotEmpty({ message: 'Custom token is required' })
  @Length(10, 2000, { message: 'Custom token length must be between 10 and 2000 characters' })
  custom_token: string;
}

export interface SessionResponse {
  ok: true;
  message: string;
  data: Record<string, never>;
  metadata: {
    request_id: string;
    timestamp: string;
  };
}
