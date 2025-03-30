import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UserRole } from 'src/users/entities/user.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  // Creamos un mock para el servicio de órdenes
  const mockOrdersService = {
    createOrder: jest.fn(),
    findAllBySeller: jest.fn(),
    findAllByBuyer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);

    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('debería llamar a ordersService.createOrder con los argumentos correctos y retornar el resultado', async () => {
      const createOrderDto = {
        items: [{ productId: 10, quantity: 2 }],
        address: 'Test address',
        transactionId: 'abc123',
      };
      const req = { user: { id: 1 } };

      const expectedOrder = { id: 123, ...createOrderDto };

      // Simulamos que se resuelve la promesa con expectedOrder
      mockOrdersService.createOrder.mockResolvedValue(expectedOrder);

      const result = await controller.createOrder(createOrderDto, req);

      // Verificamos que se llamó al servicio con los parámetros esperados
      expect(ordersService.createOrder).toHaveBeenCalledWith(
        createOrderDto,
        req.user,
      );
      expect(result).toEqual(expectedOrder);
    });
  });

  describe('findAll', () => {
    it('debería llamar a ordersService.findAllBySeller si el rol del usuario es SELLER', async () => {
      const req = { user: { id: 2, role: UserRole.SELLER } };
      const expectedOrders = [{ id: 1 }];

      mockOrdersService.findAllBySeller.mockResolvedValue(expectedOrders);

      const result = await controller.findAll(req);

      expect(ordersService.findAllBySeller).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(expectedOrders);
    });

    it('debería llamar a ordersService.findAllByBuyer si el rol del usuario no es SELLER', async () => {
      const req = { user: { id: 3, role: 'BUYER' } };
      const expectedOrders = [{ id: 2 }];

      mockOrdersService.findAllByBuyer.mockResolvedValue(expectedOrders);

      const result = await controller.findAll(req);

      expect(ordersService.findAllByBuyer).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(expectedOrders);
    });
  });
});
