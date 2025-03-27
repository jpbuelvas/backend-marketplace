import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { UserService } from '../users/user.service';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    private usersService: UserService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    ownerPayload: User,
  ): Promise<Product> {
    if (ownerPayload.role !== UserRole.SELLER) {
      throw new ForbiddenException(
        'Solo los vendedores pueden crear productos',
      );
    }
    // Obtén la entidad completa del usuario desde la base de datos
    const owner = await this.usersService.findOne(ownerPayload.id);
    if (!owner) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const product = this.productsRepository.create({
      ...createProductDto,
      owner,
    });
    return this.productsRepository.save(product);
  }

  async findByOwner(user: any): Promise<Product[]> {
    const ownerId = user.sub || user.id; // Usa 'sub' si existe, sino 'id'
    return this.productsRepository.find({
      where: { owner: { id: ownerId } }, // Indica la relación por el ID
      relations: ['owner'], // Carga la relación owner
    });
  }
  async getAllProducts(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findAllSearch(filters?: any): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product');

    if (filters.name) {
      query.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });
    }
    if (filters.sku) {
      query.andWhere('product.sku = :sku', { sku: filters.sku });
    }
    if (filters.minPrice) {
      query.andWhere('product.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }
    if (filters.maxPrice) {
      query.andWhere('product.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }
    return query.getMany();
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }
}
