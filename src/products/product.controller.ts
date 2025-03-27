import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.service';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // Crear producto (solo vendedor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user);
  }

  // Listar productos con filtros
  @Get()
  async getAllProducts() {
    return this.productsService.getAllProducts();
  }
  @UseGuards(JwtAuthGuard)
  @Get('filter')
  async findAllSearch(@Query() query) {
    return this.productsService.findAllSearch(query);
  }

  // Listar productos del vendedor autenticado
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Get('my-products')
  async findByOwner(@Request() req) {
    console.log(req.user);
    return this.productsService.findByOwner(req.user);
  }
}
