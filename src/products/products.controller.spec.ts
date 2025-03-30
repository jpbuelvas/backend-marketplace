import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './product.controller';
import { ProductsService } from './products.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: any;
  let configService: any;

  beforeEach(async () => {
    // Creamos mocks para los servicios que inyecta el controlador
    productsService = {
      createWithImage: jest.fn(),
      create: jest.fn(),
      getAllProducts: jest.fn(),
      findAllSearch: jest.fn(),
      findByOwner: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: productsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('createWithImage', () => {
    it('debería llamar a createWithImage y retornar el producto creado', async () => {
      const file = { filename: 'test.jpg' } as Express.Multer.File;
      const createProductDto = {
        sku: 'sku123',
        name: 'Test Product',
        quantity: 10,
        price: 100,
        ownerId: 1,
        ImageURL: '',
      };
      const req = { user: { id: 1, role: UserRole.SELLER } };
      const product = { id: 1, sku: 'sku1', name: 'Product 1' };
      productsService.createWithImage.mockResolvedValue(product);

      const result = await controller.createWithImage(
        file,
        createProductDto,
        req,
      );

      // Se espera que se llame a ConfigService para obtener la URL base
      expect(configService.get).toHaveBeenCalledWith('BASE_URL');
      // Se espera que se llame al método createWithImage del servicio con la URL de la imagen generada
      expect(productsService.createWithImage).toHaveBeenCalledWith(
        createProductDto,
        req.user,
        'http://localhost:3000/uploads/test.jpg',
      );
      expect(result).toEqual(product);
    });
  });

  describe('create', () => {
    it('debería llamar a create y retornar el producto creado', async () => {
      const createProductDto = {
        sku: 'sku123',
        name: 'Test Product',
        quantity: 10,
        price: 100,
        ownerId: 1,
        ImageURL: '',
      };
      const req = { user: { id: 1, role: UserRole.SELLER } };
      const product = { id: 1, sku: 'sku1', name: 'Product 1' };
      productsService.create.mockResolvedValue(product);

      const result = await controller.create(createProductDto, req);

      expect(productsService.create).toHaveBeenCalledWith(
        createProductDto,
        req.user,
      );
      expect(result).toEqual(product);
    });
  });

  describe('getAllProducts', () => {
    it('debería retornar todos los productos', async () => {
      const products = [{ id: 1 }, { id: 2 }];
      productsService.getAllProducts.mockResolvedValue(products);

      const result = await controller.getAllProducts();

      expect(productsService.getAllProducts).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });

  describe('findAllSearch', () => {
    it('debería retornar productos filtrados según los criterios', async () => {
      const query = { name: 'test', sku: 'sku1' };
      const products = [{ id: 1 }];
      productsService.findAllSearch.mockResolvedValue(products);

      const result = await controller.findAllSearch(query);

      expect(productsService.findAllSearch).toHaveBeenCalledWith(query);
      expect(result).toEqual(products);
    });
  });

  describe('findByOwner', () => {
    it('debería llamar a findByOwner y retornar los productos del vendedor autenticado', async () => {
      const req = { user: { id: 1, sub: 1 } };
      const products = [{ id: 1 }];
      productsService.findByOwner.mockResolvedValue(products);

      const result = await controller.findByOwner(req);

      expect(productsService.findByOwner).toHaveBeenCalledWith(req.user);
      expect(result).toEqual(products);
    });
  });

  describe('updateProduct', () => {
    it('debería llamar a updateProduct y retornar el producto actualizado cuando se envía archivo', async () => {
      const file = { filename: 'updated.jpg' } as Express.Multer.File;
      const updateProductDto = { name: 'Updated Product' };
      const req = { user: { id: 1, role: UserRole.SELLER } };
      const product = { id: 1, name: 'Updated Product' };
      productsService.updateProduct.mockResolvedValue(product);

      const result = await controller.updateProduct(
        1,
        file,
        updateProductDto,
        req,
      );

      // Se espera que se haya generado la URL de la imagen y se agregue al DTO
      expect(configService.get).toHaveBeenCalledWith('BASE_URL');
      expect(productsService.updateProduct).toHaveBeenCalledWith(
        1,
        {
          ...updateProductDto,
          ImageURL: 'http://localhost:3000/uploads/updated.jpg',
        },
        req.user,
      );
      expect(result).toEqual(product);
    });

    it('debería lanzar BadRequestException si el campo user del DTO no es JSON válido', async () => {
      const file = undefined;
      const updateProductDto = { user: 'invalid-json' };
      const req = { user: { id: 1, role: UserRole.SELLER } };

      await expect(
        controller.updateProduct(1, file, updateProductDto, req),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteProduct', () => {
    it('debería llamar a deleteProduct y retornar el mensaje de confirmación', async () => {
      const req = { user: { id: 1, role: UserRole.SELLER } };
      const response = { message: 'Producto eliminado exitosamente' };
      productsService.deleteProduct.mockResolvedValue(response);

      const result = await controller.deleteProduct(1, req);

      expect(productsService.deleteProduct).toHaveBeenCalledWith(1, req.user);
      expect(result).toEqual(response);
    });
  });
});
