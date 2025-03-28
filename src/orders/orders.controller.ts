import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un pedido' })
  @ApiResponse({ status: 201, description: 'Pedido creado correctamente' })
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    // req.user debe contener la información del comprador (buyer)
    return this.ordersService.createOrder(createOrderDto, req.user);
  }
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    const user = req.user;
    if (user.role === UserRole.SELLER) {
      return this.ordersService.findAllBySeller(user);
    } else {
      return this.ordersService.findAllByBuyer(user);
    }
  }
}
