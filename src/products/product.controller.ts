import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  Param,
  Delete,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.service';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private readonly configService: ConfigService, // Inyectamos ConfigService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Post('create-with-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const fileExtName = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Acepta solo ciertos tipos de imagenes
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createWithImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
    @Request() req,
  ) {
    const baseUrl = this.configService.get<string>('BASE_URL');

    const imageUrl = file ? `${baseUrl}/uploads/${file.filename}` : null;

    const product = await this.productsService.createWithImage(
      createProductDto,
      req.user,
      imageUrl,
    );
    return product;
  }

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER || UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const fileExtName = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Solo se permiten imágenes'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async updateProduct(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProductDto: any,
    @Request() req,
  ) {
    // Si se envía un archivo, agrega la URL generada al DTO
    if (file) {
      const baseUrl = this.configService.get<string>('BASE_URL');
      updateProductDto.imageUrl = `${baseUrl}/uploads/${file.filename}`;
    }
    // Si se envía el campo "user" como string JSON en el FormData, parsearlo
    if (updateProductDto.user) {
      try {
        updateProductDto.user = JSON.parse(updateProductDto.user);
      } catch (error) {
        throw new BadRequestException(
          error,
          'El campo user no tiene un formato JSON válido',
        );
      }
    }

    return this.productsService.updateProduct(+id, updateProductDto, req.user);
  }

  // Eliminar producto
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER || UserRole.ADMIN)
  @Delete(':id')
  async deleteProduct(@Param('id') id: number, @Request() req) {
    return this.productsService.deleteProduct(id, req.user);
  }
}
