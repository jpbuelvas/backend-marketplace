// src/cart/entities/cart.entity.ts

import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación con el usuario (comprador)
  @ManyToOne(() => User, { eager: true })
  user: User;

  // Relación con los items del carrito
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  items: CartItem[];
}
