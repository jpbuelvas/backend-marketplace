import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CANCELEND = 'canceled',
  CONFIRMED = 'confirmed',
}
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders)
  buyer: User;

  // Para este ejemplo, asumiremos que el pedido es de un solo vendedor.
  @ManyToOne(() => User)
  seller: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Column({ nullable: true })
  transactionId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: OrderStatus.PENDING })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
