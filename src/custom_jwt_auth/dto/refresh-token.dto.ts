import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Firebase refresh token to exchange for new ID token and refresh token',
    example: 'AMf-vBz5tQ_kdiL7XDpU17cwGuInFrM6PXxeswRP5vEbRPScz96L2F4t7iH4U3ER7ZMDUK-gldq14mnT2OEN4RrkfNXHys_Q4bx0UtZ7G40y3WYqKJLD2qXZrGB6ig4ZwEPIoUokCxB2oUJzpmASf2eAS0YSvPWHwxHHgEEzgt8dWkVCxOQ3sgdkaamVwbVSjJ_9FZdK5cCO3aq21haL5imzYbmWyrZMTYjltOtqF-QDywLxmfu1eMA',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refresh_token: string;
}
