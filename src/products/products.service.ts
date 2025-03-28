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

  async createWithImage(
    createProductDto: CreateProductDto,
    ownerPayload: any,
    imageUrl: string | null,
  ): Promise<Product> {
    if (ownerPayload.role !== UserRole.SELLER) {
      throw new ForbiddenException(
        'Solo los vendedores pueden crear productos',
      );
    }

    // Obtén la entidad completa del usuario desde la base de datos
    const owner = await this.usersService.findOne(ownerPayload.sub);
    if (!owner) {
      throw new NotFoundException('Usuario no encontrado');
    }
    // Crea el producto incluyendo la URL de la imagen (puede ser null si no se envió)
    const product = this.productsRepository.create({
      ...createProductDto,
      ImageURL: imageUrl,
      owner,
    });

    return await this.productsRepository.save(product);
  }

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
  async updateProductQuantity(
    id: number,
    newquantity: number,
  ): Promise<Product> {
    const product = await this.findById(id);
    if (product.quantity < newquantity) {
      throw new ForbiddenException('No hay suficiente stock');
    }
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    product.quantity = newquantity;
    return this.productsRepository.save(product);
  }
  // Método para actualizar producto
  async updateProduct(
    id: number,
    updateProductDto: any,
    user: any,
  ): Promise<Product> {
    const product = await this.findById(id);
    // Verifica que el usuario sea el propietario del producto
    if (product.owner.id !== (user?.sub || user?.id)) {
      throw new ForbiddenException(
        'No tienes permiso para editar este producto',
      );
    }
    const updatedProduct = await this.productsRepository.preload({
      id,
      ...updateProductDto,
    });
    if (!updatedProduct) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.productsRepository.save(updatedProduct);
  }

  // Método para eliminar producto
  async deleteProduct(id: number, user: any): Promise<{ message: string }> {
    const product = await this.findById(id);
    // Verifica que el usuario sea el propietario del producto
    if (product.owner.id !== (user?.sub || user?.id)) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este producto',
      );
    }
    await this.productsRepository.delete(id);
    return { message: 'Producto eliminado exitosamente' };
  }
}
