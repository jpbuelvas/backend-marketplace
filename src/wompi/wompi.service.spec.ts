import { Test, TestingModule } from '@nestjs/testing';
import { WompiService } from './wompi.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

// Descripción: Pruebas unitarias para WompiService

describe('WompiService', () => {
  let service: WompiService;
  let configService: ConfigService;

  beforeEach(async () => {
    // Creamos un mock para ConfigService incluyendo WOMPI_INTEGRITY_SECRET
    configService = {
      get: jest.fn((key: string) => {
        const config = {
          WOMPI_PRIVATE_KEY: 'test_private_key',
          WOMPI_PUBLIC_KEY: 'test_public_key',
          WOMPI_URL: 'https://sandbox.wompi.co',
          WOMPI_INTEGRITY_SECRET: 'test_integrity_secret',
        };
        return config[key];
      }),
    } as unknown as ConfigService;

    // Creamos el módulo de prueba con los servicios necesarios
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<WompiService>(WompiService);
  });

  describe('getIntegritySignature', () => {
    it('debería generar un hash SHA-256 a partir del string proporcionado', () => {
      const reference = 'test_reference';
      const amountInCents = 1000;
      const currency = 'COP';
      // Se construye la cadena igual que en la función real:
      // signatureString = `${reference}${amountInCents}${currency}${this.integritySecret}`
      const signatureString = `${reference}${amountInCents}${currency}test_integrity_secret`;
      const expectedHash = crypto
        .createHash('sha256')
        .update(signatureString)
        .digest('hex');

      expect(
        service.getIntegritySignature(reference, amountInCents, currency),
      ).toBe(expectedHash);
    });
  });

  describe('getTransactionStatus', () => {
    it('debería retornar el estado de la transacción si la solicitud es exitosa', async () => {
      const transactionId = '12345';
      const mockResponse = { data: { status: 'APPROVED' } };

      // Simulamos una respuesta exitosa de axios.get
      jest.spyOn(axios, 'get').mockResolvedValue(mockResponse);

      const result = await service.getTransactionStatus(transactionId);
      expect(result).toEqual(mockResponse.data);
    });
  });
});
