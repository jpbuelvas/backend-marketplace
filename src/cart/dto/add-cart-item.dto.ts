import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
