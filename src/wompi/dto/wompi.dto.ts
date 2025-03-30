import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class IntegritySignatureDTO {
  @ApiProperty({ example: '143412332421112' })
  @IsString()
  reference: string;
  @ApiProperty({ example: 211000000 })
  @IsInt()
  amountInCents: number;
  @ApiProperty({ example: 'COP' })
  @IsString()
  currency: string;
}

export class TransactionIdDTO {
  @ApiProperty({ example: '14545-5151221-112' })
  @IsString()
  id: string;
}
