import { IsNotEmpty, IsInt, Min, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Product Name' })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: 'ALFA-10' })
  @IsNotEmpty()
  sku: string;
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
  @ApiProperty({ example: 10.99 })
  @IsNumber()
  price: number;
  @ApiProperty({ example: 'http://example.com/image.jpg' })
  ImageURL: string;
}
