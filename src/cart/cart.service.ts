import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/car.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  // Obtiene o crea el carrito del comprador
  async getOrCreateCart(user: User): Promise<Cart> {
    if (user.role !== UserRole.BUYER) {
      throw new ForbiddenException('Solo los compradores pueden tener carrito');
    }
    let cart = await this.cartRepository.findOne({ where: { user } });
    if (!cart) {
      cart = this.cartRepository.create({ user, items: [] });
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  async addItem(
    user: User,
    productId: number,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(user);
    const product = await this.productsService.findById(productId);
    let item = cart.items.find((item) => item.product.id === product.id);
    if (item) {
      item.quantity += quantity;
      await this.cartItemRepository.save(item);
    } else {
      item = this.cartItemRepository.create({ cart, product, quantity });
      cart.items.push(item);
      await this.cartItemRepository.save(item);
    }
    return cart;
  }

  async getCart(user: User): Promise<Cart> {
    return this.getOrCreateCart(user);
  }
}
