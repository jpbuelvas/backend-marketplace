import {
  IsNotEmpty,
  IsInt,
  Min,
  ValidateNested,
  ArrayNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    example: 123456,
    description: 'Identificador único de la transacción',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({
    example: 'Calle Falsa 123, Ciudad, País',
    description: 'Dirección de envío',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
