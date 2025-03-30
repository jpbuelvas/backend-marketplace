import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User, UserRole } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

// Descripción: Pruebas unitarias para UserService

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  // Configuración del módulo de testing antes de cada prueba
  beforeEach(async () => {
    // Se crea el módulo de testing de NestJS, inyectando el UserService y un mock del repositorio de User
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          // Se inyecta el repositorio de User usando el token de TypeORM y se simulan sus métodos
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    // Se obtiene la instancia del servicio y del repositorio mockeado
    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // Pruebas para el método create
  describe('create', () => {
    it('debería crear un usuario exitosamente', async () => {
      // Se define el DTO con datos válidos para la creación del usuario
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullname: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: UserRole.ADMIN,
      };

      // Simulamos que no existe un usuario con el mismo email
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      // Simulamos la creación del usuario (sin hash aún)
      (repository.create as jest.Mock).mockImplementation(
        (userData) => userData,
      );
      // Simulamos que el método save retorna el usuario creado con un id asignado
      (repository.save as jest.Mock).mockImplementation((userData) =>
        Promise.resolve({ id: '1', ...userData }),
      );

      // Se invoca el método create del servicio
      const user = await service.create(createUserDto);

      // Verifica que se haya consultado el repositorio para verificar la existencia del usuario
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      // Verifica que se haya llamado al método create y save del repositorio
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(user).toHaveProperty('id');
      expect(user.password).not.toBe(createUserDto.password);
    });

    it('debería lanzar un ConflictException si las contraseñas no coinciden', async () => {
      // Se define un DTO con contraseñas que no coinciden
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullname: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password321',
        role: UserRole.SELLER,
      };

      // Se espera que la creación del usuario lance una excepción de conflicto
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debería lanzar un ConflictException si el usuario ya existe', async () => {
      // Se define un DTO con datos válidos
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        fullname: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: UserRole.ADMIN,
      };

      // Se simula que ya existe un usuario con el mismo email
      (repository.findOne as jest.Mock).mockResolvedValue({
        id: 'existingUserId',
      });

      // Se espera que la creación del usuario lance una excepción de conflicto
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findByEmail', () => {
    it('debería retornar un usuario por email', async () => {
      const email = 'test@example.com';
      const expectedUser = { id: '1', email };

      // Se simula la respuesta del repositorio al buscar por email
      (repository.findOne as jest.Mock).mockResolvedValue(expectedUser);

      // Se invoca el método findByEmail y se verifica el resultado
      const user = await service.findByEmail(email);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(user).toEqual(expectedUser);
    });
  });

  // Pruebas para el método findOne
  describe('findOne', () => {
    it('debería retornar un usuario por id', async () => {
      const id = 1;
      const expectedUser = { id, email: 'test@example.com' };

      // Se simula la respuesta del repositorio al buscar por id
      (repository.findOne as jest.Mock).mockResolvedValue(expectedUser);

      // Se invoca el método findOne y se verifica el resultado
      const user = await service.findOne(id);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(user).toEqual(expectedUser);
    });
  });
});
