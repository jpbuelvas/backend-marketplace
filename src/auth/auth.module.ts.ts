import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Módulo para cargar variables de entorno
    ConfigModule,

    // Módulo Passport para la estrategia JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configuración asíncrona del JwtModule
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET') || 'mysecretkey',
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRATION') || '1h',
          },
        };
      },
    }),

    // Módulo de usuarios
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService], // Exporta el AuthService si lo usas en otros módulos
})
export class AuthModule {}
