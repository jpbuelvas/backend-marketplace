import { validate } from 'class-validator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './entities/user.entity';

// Descripción: Pruebas unitarias para validar el CreateUserDto

describe('CreateUserDto', () => {
  // Prueba: Debería validar correctamente un DTO con todos los valores válidos
  it('debería validar un CreateUserDto válido', async () => {
    const dto = new CreateUserDto();
    dto.email = 'john@example.com';
    // NOTA: Debido al decorador @IsEmail en fullname, se debe proveer un valor con formato email,
    // aunque el ejemplo sugiera un nombre, en este caso se usa un email válido.
    dto.fullname = 'john.doe@example.com';
    dto.password = 'password123';
    dto.confirmPassword = 'password123';
    dto.role = UserRole.ADMIN; // Se asume que "admin" es un valor válido del enum UserRole

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  // Prueba: Debería fallar la validación si el email no tiene un formato válido
  it('debería fallar si el email no es válido', async () => {
    const dto = new CreateUserDto();
    dto.email = 'invalid-email';
    dto.fullname = 'john.doe@example.com';
    dto.password = 'password123';
    dto.confirmPassword = 'password123';
    dto.role = UserRole.ADMIN;

    const errors = await validate(dto);
    // Se espera que existan errores en la propiedad "email"
    expect(errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'email' })]),
    );
  });

  it('debería fallar si fullname no es un email válido', async () => {
    const dto = new CreateUserDto();
    dto.email = 'john@example.com';
    // Aunque se espera un nombre, el decorador @IsEmail lo requiere, por lo que "John Doe" es inválido
    dto.fullname = 'John Doe';
    dto.password = 'password123';
    dto.confirmPassword = 'password123';
    dto.role = UserRole.SELLER;

    const errors = await validate(dto);
    // Se espera que existan errores en la propiedad "fullname"
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'fullname' }),
      ]),
    );
  });

  it('debería fallar si password es menor a 6 caracteres', async () => {
    const dto = new CreateUserDto();
    dto.email = 'john@example.com';
    dto.fullname = 'john.doe@example.com';
    dto.password = '123';
    dto.confirmPassword = '123';
    dto.role = UserRole.SELLER;

    const errors = await validate(dto);
    // Se espera que existan errores en la propiedad "password"
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'password' }),
      ]),
    );
  });

  it('debería fallar si confirmPassword es menor a 6 caracteres', async () => {
    const dto = new CreateUserDto();
    dto.email = 'john@example.com';
    dto.fullname = 'john.doe@example.com';
    dto.password = 'password123';
    dto.confirmPassword = '123';
    dto.role = UserRole.SELLER;

    const errors = await validate(dto);
    // Se espera que existan errores en la propiedad "confirmPassword"
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'confirmPassword' }),
      ]),
    );
  });

  it('debería fallar si role no es un valor válido de UserRole', async () => {
    const dto = new CreateUserDto();
    dto.email = 'john@example.com';
    dto.fullname = 'john.doe@example.com';
    dto.password = 'password123';
    dto.confirmPassword = 'password123';
    // Se asigna un valor no permitido para el enum
    dto.role = 'invalid' as any;

    const errors = await validate(dto);
    // Se espera que existan errores en la propiedad "role"
    expect(errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'role' })]),
    );
  });
});
