import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private productsService: ProductsService,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    buyer: User,
  ): Promise<Order> {
    // Si se envía un transactionId, verificamos que no exista ya una orden con ese ID.
    if (createOrderDto.transactionId) {
      const existingOrder = await this.orderRepository.findOne({
        where: { transactionId: createOrderDto.transactionId },
      });
      if (existingOrder) {
        throw new BadRequestException(
          'Ya existe un pedido con este transactionId, no se puede crear un duplicado.',
        );
      }
    }

    let total = 0;
    const orderItems: OrderItem[] = [];
    let seller: User = null; // Suponemos que todos los productos pertenecen al mismo vendedor.

    // Itera sobre cada item del pedido.
    for (const item of createOrderDto.items) {
      // Se asume que en el DTO el id del producto se envía en la propiedad "productId".
      const product = await this.productsService.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Producto ${item.productId} no encontrado`);
      }
      if (product.quantity < item.quantity) {
        throw new BadRequestException(
          `No hay suficiente stock para el producto ${product.name}`,
        );
      }

      // Asignar el vendedor (suponiendo que todos los productos sean del mismo vendedor)
      if (!seller) {
        seller = product.owner;
      } else if (seller && product.owner.id !== seller.id) {
        throw new BadRequestException(
          'Todos los productos deben pertenecer al mismo vendedor',
        );
      }

      // Actualiza el stock del producto.
      product.quantity = product.quantity - item.quantity;
      await this.productsService.updateProductQuantity(
        product.id,
        product.quantity,
      );

      // Calcula el total del item y crea el objeto OrderItem.
      const itemTotal = Number(product.price) * item.quantity;
      total += itemTotal;

      const orderItem = this.orderItemRepository.create({
        product,
        quantity: item.quantity,
        price: product.price,
      });
      orderItems.push(orderItem);
    }

    // Crea el pedido con el transactionId y address (si se envían en el DTO)
    const order = this.orderRepository.create({
      buyer,
      seller,
      items: orderItems,
      total,
      status: OrderStatus.PENDING,
      transactionId: createOrderDto.transactionId,
      address: createOrderDto.address,
    });

    return this.orderRepository.save(order);
  }

  async findAllBySeller(user: any): Promise<Order[]> {
    const ownerId = user.sub || user.id; // Usa 'sub' si existe, sino 'id'
    return this.orderRepository.find({
      where: { seller: { id: ownerId } }, // Indica la relación por el ID
      relations: ['seller', 'buyer'],
    });
  }

  async findAllByBuyer(user: any): Promise<Order[]> {
    const ownerId = user.sub || user.id; // Usa 'sub' si existe, sino 'id'
    return this.orderRepository.find({
      where: { seller: { id: ownerId } }, // Indica la relación por el ID
      relations: ['buyer', 'seller'],
    });
  }
}
