import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
@Controller('user')
export class UserController {
  constructor(private usersService: UserService) {}
  @ApiTags('register')
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { message: 'Usuario registrado correctamente', userId: user.id };
  }
}
