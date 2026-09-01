import { Controller, Post, Req, Res, Headers, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  async handleWebhook(@Req() req: any, @Res() res: any, @Headers('stripe-signature') signature: string) {
    try {
      // In NestJS, getting the raw body for Stripe can be tricky.
      // Usually, it's done via raw-body or custom middleware.
      // Assuming req.body contains the parsed event (or raw buffer if configured)
      const payload = req.rawBody || req.body;
      
      const result = await this.paymentsService.handleWebhook(
        signature,
        Buffer.isBuffer(payload) ? payload : Buffer.from(JSON.stringify(payload))
      );
      
      return res.status(200).send(result);
    } catch (err: any) {
      console.error('Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  @Post('webhook/mercadopago')
  async handleMercadoPagoWebhook(@Query() query: any, @Res() res: any) {
    try {
      const result = await this.paymentsService.handleMercadoPagoWebhook(query);
      return res.status(200).send(result);
    } catch (err: any) {
      console.error('MP Webhook Error:', err.message);
      return res.status(400).send(`MP Webhook Error: ${err.message}`);
    }
  }
}
