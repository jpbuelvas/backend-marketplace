import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UserService } from '../users/user.service';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MoreThan } from 'typeorm';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductsRepository: any;
  let mockUserService: any;

  beforeEach(async () => {
    // Creamos mocks para el repositorio y para el servicio de usuarios
    mockProductsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };

    mockUserService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductsRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('createWithImage', () => {
    it('debería lanzar ForbiddenException si el owner no es SELLER', async () => {
      const createProductDto = {
        sku: 'sku123',
        name: 'Test Product',
        quantity: 10,
        price: 100,
        ownerId: 1,
        ImageURL: '',
      };
      const ownerPayload = { id: 1, role: 'BUYER' };

      await expect(
        service.createWithImage(
          createProductDto,
          ownerPayload,
          'http://example.com/image.jpg',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar NotFoundException si el usuario owner no se encuentra', async () => {
      const createProductDto = {
        sku: 'sku123',
        name: 'Test Product',
        quantity: 10,
        price: 100,
        ownerId: 2,
        ImageURL: '',
      };
      const ownerPayload = { id: 1000, role: UserRole.SELLER };
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        service.createWithImage(
          createProductDto,
          ownerPayload,
          'http://example.com/image.jpg',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException si ya existe un producto con el mismo SKU', async () => {
      const createProductDto = {
        sku: 'sku123',
        name: 'Test Product',
        quantity: 10,
        price: 100,
        ownerId: 1,
        ImageURL: '',
      };
      const ownerPayload = { id: 1, role: UserRole.SELLER };
      const owner = { id: 1, role: UserRole.SELLER };
      mockUserService.findOne.mockResolvedValue(owner);
      mockProductsRepository.findOne.mockResolvedValue({ id: 10 });

      await expect(
        service.createWithImage(
          createProductDto,
          ownerPayload,
          'http://example.com/image.jpg',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería crear y guardar el producto exitosamente', async () => {
      const createProductDto = {
        sku: 'sku123',
        name: 'Test Product',
        quantity: 10,
        price: 100,
        ownerId: 1,
        ImageURL: '',
      };
      const ownerPayload = { id: 1, role: UserRole.SELLER };
      const owner = { id: 1, role: UserRole.SELLER };
      mockUserService.findOne.mockResolvedValue(owner);
      mockProductsRepository.findOne.mockResolvedValue(null);
      const createdProduct = {
        ...createProductDto,
        ImageURL: 'http://example.com/image.jpg',
        owner,
        id: 5,
      };
      mockProductsRepository.create.mockReturnValue(createdProduct);
      mockProductsRepository.save.mockResolvedValue(createdProduct);

      const result = await service.createWithImage(
        createProductDto,
        ownerPayload,
        'http://example.com/image.jpg',
      );

      expect(result).toEqual(createdProduct);
      expect(mockProductsRepository.create).toHaveBeenCalledWith({
        ...createProductDto,
        ImageURL: 'http://example.com/image.jpg',
        owner,
      });
    });
  });

  describe('create', () => {
    it('debería lanzar ForbiddenException si el owner no es SELLER', async () => {
      const createProductDto = {
        sku: 'sku123',
        name: 'Test Product',
        quantity: 10,
        price: 100,
        ownerId: 1,
        ImageURL: '',
      };
      const ownerPayload: User = {
        id: 1,
        role: UserRole.BUYER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      await expect(
        service.create(createProductDto, ownerPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar NotFoundException si el usuario owner no se encuentra', async () => {
      const createProductDto = {
        sku: 'sku123',
        name: 'Test Product',
        quantity: 10,
        price: 100,
        ownerId: 1,
        ImageURL: '',
      };
      const ownerPayload: User = {
        id: 145343,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        service.create(createProductDto, ownerPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería crear y guardar el producto exitosamente', async () => {
      const createProductDto = {
        sku: 'sku123',
        name: 'Test Product',
        quantity: 10,
        price: 100,
        ownerId: 1,
        ImageURL: '',
      };
      const ownerPayload: User = {
        id: 1,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      const owner = {
        id: 1,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        passowrd: '123',
        fullname: 'Juan Pablo',
      };
      mockUserService.findOne.mockResolvedValue(owner);
      const createdProduct = { ...createProductDto, owner, id: 5 };
      mockProductsRepository.create.mockReturnValue(createdProduct);
      mockProductsRepository.save.mockResolvedValue(createdProduct);

      const result = await service.create(createProductDto, ownerPayload);
      expect(result).toEqual(createdProduct);
    });
  });

  describe('findByOwner', () => {
    it('debería retornar los productos del owner dado', async () => {
      const user = { id: 1, sub: 1 };
      const products = [{ id: 1 }, { id: 2 }];
      mockProductsRepository.find.mockResolvedValue(products);

      const result = await service.findByOwner(user);

      expect(result).toEqual(products);
      expect(mockProductsRepository.find).toHaveBeenCalledWith({
        where: { owner: { id: user.sub } },
        relations: ['owner'],
      });
    });
  });

  describe('getAllProducts', () => {
    it('debería retornar todos los productos con quantity > 0', async () => {
      const products = [{ id: 1, quantity: 10 }];
      mockProductsRepository.find.mockResolvedValue(products);

      const result = await service.getAllProducts();

      expect(result).toEqual(products);
      expect(mockProductsRepository.find).toHaveBeenCalledWith({
        where: { quantity: MoreThan(0) },
      });
    });
  });

  describe('findAllSearch', () => {
    it('debería retornar productos filtrados según los criterios y con quantity > 0', async () => {
      const filters = {
        name: 'Test',
        sku: 'sku123',
        minPrice: 50,
        maxPrice: 150,
      };
      // Creamos mocks para simular el encadenamiento de la query
      const getManyMock = jest.fn().mockResolvedValue([{ id: 1 }]);
      const andWhereMock = jest.fn().mockReturnThis();
      const whereMock = jest.fn().mockReturnThis();
      const createQueryBuilderMock = {
        andWhere: andWhereMock,
        where: whereMock,
        getMany: getManyMock,
      };
      mockProductsRepository.createQueryBuilder.mockReturnValue(
        createQueryBuilderMock,
      );

      const result = await service.findAllSearch(filters);

      expect(result).toEqual([{ id: 1 }]);
      // Verificamos que se hayan llamado los métodos de encadenamiento de la query
      expect(andWhereMock).toHaveBeenCalledTimes(4);
      expect(getManyMock).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('debería lanzar NotFoundException si no se encuentra el producto', async () => {
      mockProductsRepository.findOne.mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });

    it('debería retornar el producto si se encuentra', async () => {
      const product = { id: 1 };
      mockProductsRepository.findOne.mockResolvedValue(product);

      const result = await service.findById(1);

      expect(result).toEqual(product);
    });
  });

  describe('updateProductQuantity', () => {
    it('debería lanzar BadRequestException si newquantity es undefined', async () => {
      const owner: User = {
        id: 1,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      const product: Product = {
        id: 1,
        name: 'Producto de prueba',
        sku: 'SKU123',
        price: 100,
        ImageURL: 'http://example.com/image.jpg',
        quantity: 10,
        owner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findById').mockResolvedValue(product);

      await expect(service.updateProductQuantity(1, undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar ForbiddenException si product.quantity es menor que newquantity', async () => {
      const owner: User = {
        id: 1,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      const product: Product = {
        id: 1,
        name: 'Producto de prueba',
        sku: 'SKU123',
        price: 100,
        ImageURL: 'http://example.com/image.jpg',
        quantity: 0,
        owner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(product);

      await expect(service.updateProductQuantity(1, 10)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debería actualizar y retornar el producto cuando newquantity es válida', async () => {
      const owner: User = {
        id: 1,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      const product: Product = {
        id: 1,
        name: 'Producto de prueba',
        sku: 'SKU123',
        price: 100,
        ImageURL: 'http://example.com/image.jpg',
        quantity: 10,
        owner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedProduct = { id: 1, quantity: 8 };
      jest.spyOn(service, 'findById').mockResolvedValue(product);
      mockProductsRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.updateProductQuantity(1, 8);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('updateProduct', () => {
    it('debería lanzar ForbiddenException si el usuario no es el owner', async () => {
      const owner: User = {
        id: 1,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      const product: Product = {
        id: 1,
        name: 'Producto de prueba',
        sku: 'SKU123',
        price: 100,
        ImageURL: 'http://example.com/image.jpg',
        quantity: 10,
        owner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(product);
      const updateProductDto: UpdateProductDto = { name: 'New Name' };
      const user = { id: 2 };

      await expect(
        service.updateProduct(1, updateProductDto, user),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debería lanzar NotFoundException si preload retorna null', async () => {
      const owner: User = {
        id: 1,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      const product: Product = {
        id: 1,
        name: 'Producto de prueba',
        sku: 'SKU123',
        price: 100,
        ImageURL: 'http://example.com/image.jpg',
        quantity: 10,
        owner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(product);
      const updateProductDto: UpdateProductDto = { name: 'New Name' };
      const user = { id: 1 };
      mockProductsRepository.preload.mockResolvedValue(null);

      await expect(
        service.updateProduct(1, updateProductDto, user),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería actualizar y retornar el producto exitosamente', async () => {
      const owner: User = {
        id: 1,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      const product: Product = {
        id: 1,
        name: 'Producto de prueba',
        sku: 'SKU123',
        price: 100,
        ImageURL: 'http://example.com/image.jpg',
        quantity: 10,
        owner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(product);
      const updateProductDto: UpdateProductDto = { name: 'New Name' };
      const user = { id: 1 };
      const updatedProduct = { id: 1, owner: { id: 1 }, name: 'New Name' };
      mockProductsRepository.preload.mockResolvedValue(updatedProduct);
      mockProductsRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.updateProduct(1, updateProductDto, user);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('deleteProduct', () => {
    it('debería lanzar ForbiddenException si el usuario no es el owner', async () => {
      const owner: User = {
        id: 1,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      const product: Product = {
        id: 1,
        name: 'Producto de prueba',
        sku: 'SKU123',
        price: 100,
        ImageURL: 'http://example.com/image.jpg',
        quantity: 10,
        owner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(product);
      const user = { id: 2 };

      await expect(service.deleteProduct(1, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debería eliminar el producto y retornar un mensaje de confirmación', async () => {
      const owner: User = {
        id: 1,
        role: UserRole.SELLER,
        email: 'Juan@gmail.com',
        password: '123',
        fullname: 'Juan Pablo',
        orders: [],
      };
      const product: Product = {
        id: 1,
        name: 'Producto de prueba',
        sku: 'SKU123',
        price: 100,
        ImageURL: 'http://example.com/image.jpg',
        quantity: 10,
        owner,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'findById').mockResolvedValue(product);
      mockProductsRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteProduct(1, { id: 1 });
      expect(result).toEqual({ message: 'Producto eliminado exitosamente' });
      expect(mockProductsRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
