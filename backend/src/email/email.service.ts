import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Configuración para Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private async sendHtmlEmail(to: string, subject: string, html: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      this.logger.warn(`No se enviará el correo a ${to} porque EMAIL_USER o EMAIL_PASS no están configurados en el .env`);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"ASTRA Store" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Correo enviado a ${to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${to}`, error);
    }
  }

  async sendPurchaseConfirmation(to: string, orderNumber: string, total: number) {
    const subject = `¡Tu compra en ASTRA fue exitosa! - Orden #${orderNumber}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0f172a; text-align: center;">¡Gracias por tu compra en ASTRA!</h2>
        <p style="color: #334155; font-size: 16px;">Hola,</p>
        <p style="color: #334155; font-size: 16px;">Hemos recibido tu pago exitosamente. Tu orden <strong>#${orderNumber}</strong> ya se encuentra <em>En Preparación</em> y muy pronto la despacharemos.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a;">Resumen de la Orden</h3>
          <p style="font-size: 18px; margin: 0;"><strong>Total Pagado:</strong> $${total.toFixed(2)}</p>
        </div>
        
        <p style="color: #334155; font-size: 16px;">Te enviaremos otro correo cuando tu paquete haya sido entregado a la empresa de logística.</p>
        <p style="color: #334155; font-size: 14px; text-align: center; margin-top: 30px;">© ${new Date().getFullYear()} ASTRA E-Commerce. Todos los derechos reservados.</p>
      </div>
    `;

    await this.sendHtmlEmail(to, subject, html);
  }

  async sendShippingNotification(to: string, clientName: string, orderNumber: string) {
    const subject = `¡Tu pedido de ASTRA está en camino! 🚀`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">¡Buenas noticias, ${clientName}!</h2>
        <p style="color: #334155; font-size: 16px;">Queríamos avisarte que tu orden <strong>#${orderNumber}</strong> acaba de ser enviada.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #eff6ff; color: #1d4ed8; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px;">
            Estado Físico: ENVIADO
          </div>
        </div>
        
        <p style="color: #334155; font-size: 16px;">El paquete físico ya se encuentra en poder de la empresa de logística y va en camino a tu domicilio.</p>
        <p style="color: #334155; font-size: 16px;">¡Esperamos que lo disfrutes mucho!</p>
        <p style="color: #334155; font-size: 14px; text-align: center; margin-top: 30px;">© ${new Date().getFullYear()} ASTRA E-Commerce.</p>
      </div>
    `;

    await this.sendHtmlEmail(to, subject, html);
  }
}
