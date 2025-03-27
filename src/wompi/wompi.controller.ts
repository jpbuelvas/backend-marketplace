import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WompiService } from './wompi.service';
import { IntegritySignatureDTO, TransactionIdDTO } from './dto/wompi.dto';

@Controller('wompi')
export class WompiController {
  constructor(private wompiService: WompiService) {}

  @Get('transaction-status')
  getTransactionStatus(@Query() transactionId: TransactionIdDTO) {
    return this.wompiService.getTransactionStatus(transactionId.id);
  }

  @Post('integrity-signature')
  getIntegritySignature(@Body() integritySignatureDto: IntegritySignatureDTO) {
    return this.wompiService.getIntegritySignature(
      integritySignatureDto.reference,
      integritySignatureDto.amountInCents,
      integritySignatureDto.currency,
    );
  }
}
