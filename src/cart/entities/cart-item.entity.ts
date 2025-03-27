// src/cart/entities/cart-item.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './car.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  // A qué carrito pertenece este item
  @ManyToOne(() => Cart, (cart) => cart.items)
  cart: Cart;

  // El producto que se está agregando
  @ManyToOne(() => Product, { eager: true })
  product: Product;

  // Cantidad de productos en el carrito
  @Column({ type: 'int' })
  quantity: number;
}
