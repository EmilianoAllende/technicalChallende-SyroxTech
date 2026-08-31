import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2026-08-26.dahlia',
    });
  }

  async createCheckoutSession(saleId: number, items: any[], clientEmail: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';

    // === MODO SIMULACIÓN ===
    // Si la clave es la de prueba falsa, saltamos la validación real de Stripe
    // y devolvemos directamente la URL de éxito para probar el flujo del frontend.
    if (secretKey === 'sk_test_123' || secretKey === 'sk_test_mock') {
      // Como no habrá webhook de Stripe real, actualizamos el estado aquí mismo:
      await this.prisma.sale.update({
        where: { id: saleId },
        data: { paymentStatus: 'Pagado', status: 'Pagado' }
      });
      return { url: `${frontendUrl}/cart?success=true&sale_id=${saleId}` };
    }
    // =======================

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'ars',
        product_data: {
          name: item.name || 'Producto genérico',
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: clientEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/cart?success=true&sale_id=${saleId}`,
      cancel_url: `${frontendUrl}/cart?canceled=true`,
      metadata: {
        saleId: saleId.toString(),
      },
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    
    if (!webhookSecret) {
      // If we don't have a webhook secret (e.g. testing locally without CLI), 
      event = JSON.parse(payload.toString());
    } else {
      try {
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          webhookSecret
        );
      } catch (err: any) {
        throw new Error(`Webhook Error: ${err.message}`);
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const saleId = parseInt(session.metadata.saleId, 10);
      
      await this.prisma.sale.update({
        where: { id: saleId },
        data: { paymentStatus: 'Pagado', status: 'Pagado' }
      });
    }

    return { received: true };
  }
}
