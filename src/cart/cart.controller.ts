import {
  Controller,
  UseGuards,
  Post,
  Body,
  Request,
  Get,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.service';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BUYER)
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('add')
  async addItem(@Body() addCartItemDto: AddCartItemDto, @Request() req) {
    const { productId, quantity } = addCartItemDto;
    const cart = await this.cartService.addItem(req.user, productId, quantity);
    return cart;
  }

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user);
  }
}
