import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private mpClient: MercadoPagoConfig;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2026-08-26.dahlia',
    });
    this.mpClient = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-dummy-token',
      options: { timeout: 5000 } 
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
      const sale = await this.prisma.sale.update({
        where: { id: saleId },
        data: { paymentStatus: 'Pagado' }
      });
      await this.emailService.sendPurchaseConfirmation(sale.clientEmail, sale.orderNumber, sale.total);
      return { url: `${frontendUrl}/cart?success=true&sale_id=${saleId}` };
    }
    // =======================

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
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
      
      const sale = await this.prisma.sale.update({
        where: { id: saleId },
        data: { paymentStatus: 'Pagado' }
      });
      await this.emailService.sendPurchaseConfirmation(sale.clientEmail, sale.orderNumber, sale.total);
    }

    return { received: true };
  }

  async createMercadoPagoPreference(saleId: number, items: any[], clientEmail: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    // === MODO SIMULACIÓN ===
    // Si no hay token real provisto, devolvemos URL de éxito directa
    if (!process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN === 'TEST-dummy-token') {
      const sale = await this.prisma.sale.update({
        where: { id: saleId },
        data: { paymentStatus: 'Pagado' }
      });
      await this.emailService.sendPurchaseConfirmation(sale.clientEmail, sale.orderNumber, sale.total);
      return { url: `${frontendUrl}/cart?success=true&sale_id=${saleId}` };
    }
    // =======================

    const preference = new Preference(this.mpClient);
    
    const mpItems = items.map(item => ({
      id: item.productId.toString(),
      title: item.name || 'Producto genérico',
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: 'ARS',
    }));

    try {
      const response = await preference.create({
        body: {
          items: mpItems,
          payer: { email: clientEmail },
          back_urls: {
            success: `${frontendUrl}/cart?success=true&sale_id=${saleId}`,
            failure: `${frontendUrl}/cart?canceled=true`,
            pending: `${frontendUrl}/cart?pending=true`,
          },
          auto_return: 'approved',
          external_reference: saleId.toString(),
          notification_url: `${backendUrl}/payments/webhook/mercadopago`,
        }
      });

      return { url: response.sandbox_init_point || response.init_point };
    } catch (error) {
      console.error('Error creating MP Preference:', error);
      throw new Error('No se pudo crear la preferencia de MercadoPago.');
    }
  }

  async handleMercadoPagoWebhook(query: any) {
    // MercadoPago envía 'data.id' y 'type' por query params en notificaciones IPN/Webhook
    if ((query.type === 'payment' || query.topic === 'payment') && (query['data.id'] || query.id)) {
      const paymentId = query['data.id'] || query.id;
      try {
        const payment = new Payment(this.mpClient);
        const paymentData = await payment.get({ id: paymentId });
        
        if (paymentData.status === 'approved' && paymentData.external_reference) {
          const saleId = parseInt(paymentData.external_reference, 10);
          
          const sale = await this.prisma.sale.update({
            where: { id: saleId },
            data: { paymentStatus: 'Pagado' }
          });
          await this.emailService.sendPurchaseConfirmation(sale.clientEmail, sale.orderNumber, sale.total);
        }
      } catch (error) {
        console.error('Error handling MP Webhook:', error);
      }
    }
    return { received: true };
  }
}
