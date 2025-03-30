import { Test, TestingModule } from '@nestjs/testing';
import { WompiController } from './wompi.controller';
import { WompiService } from './wompi.service';

// Descripción: Pruebas unitarias para WompiController
describe('WompiController', () => {
  let controller: WompiController;
  let service: WompiService;

  // Configuración del módulo de testing antes de cada prueba
  beforeEach(async () => {
    // Se crea el módulo de testing de NestJS con el controlador y un mock del servicio
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WompiController],
      providers: [
        {
          // Se proporciona un mock del servicio WompiService
          provide: WompiService,
          useValue: {
            getTransactionStatus: jest.fn(),
            getIntegritySignature: jest.fn(),
          },
        },
      ],
    }).compile();

    // Se obtiene una instancia del controlador y del servicio mockeado
    controller = module.get<WompiController>(WompiController);
    service = module.get<WompiService>(WompiService);
  });

  // Pruebas para el método getTransactionStatus del controlador
  describe('getTransactionStatus', () => {
    it('debería llamar a wompiService.getTransactionStatus con el id correcto', () => {
      //Creamos un DTO con el ID de la transacción
      const transactionIdDTO = { id: '12345' };
      // Se define la respuesta esperada que debería retornar el servicio
      const expectedResponse = { status: 'success' };

      //Simulamos el retorno del método del servicio
      (service.getTransactionStatus as jest.Mock).mockReturnValue(
        expectedResponse,
      );

      //Invocamos el método del controlador con el DTO de prueba
      const result = controller.getTransactionStatus(transactionIdDTO);

      // Verificamos que el servicio se haya llamado con el ID correcto
      expect(service.getTransactionStatus).toHaveBeenCalledWith('12345');
      // Verificamos que el resultado del controlador sea el esperado
      expect(result).toEqual(expectedResponse);
    });
  });

  // Pruebas para el método getIntegritySignature del controlador
  describe('getIntegritySignature', () => {
    it('debería llamar a wompiService.getIntegritySignature con los parámetros correctos', () => {
      // Se crea un DTO con los parámetros necesarios
      const integritySignatureDto = {
        reference: 'ref123',
        amountInCents: 1000,
        currency: 'COP',
      };
      // Se define la respuesta esperada del servicio
      const expectedResponse = { signature: 'signatureValue' };

      //Simulamos el retorno del método del servicio
      (service.getIntegritySignature as jest.Mock).mockReturnValue(
        expectedResponse,
      );

      //Invocamos el método del controlador con el DTO de prueba
      const result = controller.getIntegritySignature(integritySignatureDto);

      // Verificamos que el servicio se haya llamado con los parámetros correctos
      expect(service.getIntegritySignature).toHaveBeenCalledWith(
        'ref123',
        1000,
        'COP',
      );
      // Verificamos que el resultado del controlador sea el esperado
      expect(result).toEqual(expectedResponse);
    });
  });
});
