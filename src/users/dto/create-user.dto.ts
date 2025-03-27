import { IsEmail, IsNotEmpty, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Aiasmngiagaso23123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Aiasmngiagaso23123' })
  @IsNotEmpty()
  @MinLength(6)
  confirmPassword: string;

  @ApiProperty({ example: 'admin' })
  @IsEnum(UserRole)
  role: UserRole;
}
