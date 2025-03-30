import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

describe('OrdersService', () => {
  let service: OrdersService;

  // Creamos mocks para cada dependencia
  const mockOrderRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOrderItemRepository = {
    create: jest.fn(),
  };

  const mockProductsService = {
    findById: jest.fn(),
    updateProductQuantity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    // Limpiamos los mocks antes de cada test para evitar interferencias
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debería crear un pedido correctamente', async () => {
    const buyer = { id: 1 } as any;
    const product = {
      id: 10,
      name: 'Producto 10',
      quantity: 5,
      price: 100,
      owner: { id: 2 },
    };
    const createOrderDto = {
      transactionId: 'abc123',
      items: [{ productId: 10, quantity: 2 }],
      address: 'Dirección de envío',
    };

    // Simulamos que no existe un pedido con el mismo transactionId
    mockOrderRepository.findOne.mockResolvedValue(null);
    // Simulamos que se encuentra el producto
    mockProductsService.findById.mockResolvedValue(product);
    // Simulamos la actualización de la cantidad del producto
    mockProductsService.updateProductQuantity.mockResolvedValue({
      ...product,
      quantity: product.quantity - 2,
    });
    // Simulamos la creación de un OrderItem
    const createdOrderItem = {
      id: 100,
      product,
      quantity: 2,
      price: product.price,
    };
    mockOrderItemRepository.create.mockReturnValue(createdOrderItem);
    // Simulamos la creación del Order
    const createdOrder = {
      id: 1,
      buyer,
      seller: product.owner,
      items: [createdOrderItem],
      total: 200,
      status: 'pending',
      transactionId: createOrderDto.transactionId,
      address: createOrderDto.address,
    };
    mockOrderRepository.create.mockReturnValue(createdOrder);
    mockOrderRepository.save.mockResolvedValue(createdOrder);

    const result = await service.createOrder(createOrderDto, buyer);
    expect(result).toEqual(createdOrder);

    // Verificamos que se llamaron las funciones con los parámetros esperados
    expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
      where: { transactionId: createOrderDto.transactionId },
    });
    expect(mockProductsService.findById).toHaveBeenCalledWith(10);
    expect(mockProductsService.updateProductQuantity).toHaveBeenCalledWith(
      10,
      product.quantity,
    );
  });
  debugger;

  it('debería lanzar BadRequestException si el transactionId ya existe', async () => {
    const buyer = { id: 1 } as any;
    const createOrderDto = {
      transactionId: 'duplicado',
      items: [],
      address: 'Dirección',
    };

    // Simulamos que ya existe un pedido con ese transactionId
    mockOrderRepository.findOne.mockResolvedValue({ id: 1 });

    await expect(service.createOrder(createOrderDto, buyer)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debería lanzar NotFoundException si el producto no se encuentra', async () => {
    const buyer = { id: 1 } as any;
    const createOrderDto = {
      items: [{ productId: 999, quantity: 1 }],
      address: 'Dirección',
    };

    mockOrderRepository.findOne.mockResolvedValue(null);
    // Simulamos que el producto no se encuentra
    mockProductsService.findById.mockResolvedValue(null);

    await expect(service.createOrder(createOrderDto, buyer)).rejects.toThrow(
      NotFoundException,
    );
  });
});
