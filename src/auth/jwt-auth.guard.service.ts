import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    try {
      const token = authHeader.split(' ')[1]; // Extrae el token del header
      const decoded = this.jwtService.verify(token); // Verifica el token
      request.user = decoded; // Guarda los datos del usuario en la request
      return true;
    } catch (error) {
      return error; // Token inválido
    }
  }
}
