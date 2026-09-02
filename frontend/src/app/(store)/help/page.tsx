'use client';

import React from 'react';
import { Mail, Phone, Clock, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelpPage() {
  const faqs = [
    {
      question: '¿Cómo hago el seguimiento de mi envío?',
      answer: 'Una vez que tu pedido sea despachado, recibirás un correo electrónico automático con el estado "Enviado". Desde ese momento, el pedido suele tardar entre 2 a 5 días hábiles en llegar a tu domicilio, dependiendo de tu ubicación.'
    },
    {
      question: '¿Cuáles son los métodos de pago aceptados?',
      answer: 'Aceptamos todas las tarjetas de crédito y débito a través de Stripe y MercadoPago. Los pagos son procesados de forma 100% segura.'
    },
    {
      question: '¿Puedo cancelar o modificar mi pedido?',
      answer: 'Puedes cancelar tu pedido siempre y cuando su estado logístico siga siendo "En Preparación". Si ya ha sido marcado como "Enviado", no podremos cancelarlo hasta que lo recibas y gestiones una devolución.'
    },
    {
      question: '¿Tienen tienda física?',
      answer: 'Actualmente somos una tienda 100% online, lo que nos permite ofrecerte mejores precios al reducir costos operativos.'
    },
    {
      question: '¿Cómo funcionan las reseñas?',
      answer: 'Para garantizar la máxima transparencia, solo los clientes que hayan completado exitosamente la compra de un producto pueden dejar una reseña sobre el mismo. Podrás hacerlo desde la sección "Mis Compras".'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Cabecera */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Centro de Ayuda
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Estamos aquí para ayudarte. Encuentra respuestas a las preguntas más frecuentes o contáctanos directamente.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Preguntas Frecuentes */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details 
                key={index} 
                className="group bg-card border border-border rounded-lg overflow-hidden [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between p-4 font-medium cursor-pointer text-foreground hover:bg-muted/50 transition-colors">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-300 group-open:-rotate-180" />
                </summary>
                <div className="p-4 pt-0 text-muted-foreground leading-relaxed border-t border-border/50 bg-muted/20">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Info de Contacto */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Contacto</h2>
          
          <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Email</h3>
                <p className="text-sm text-muted-foreground mt-1">soporte@syroxtech.com</p>
                <p className="text-xs text-muted-foreground">Respondemos en 24hs</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Teléfono</h3>
                <p className="text-sm text-muted-foreground mt-1">+54 11 1234-5678</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Horario</h3>
                <p className="text-sm text-muted-foreground mt-1">Lun - Vie, 9:00 - 18:00</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button className="w-full" onClick={() => alert('Esta función abriría un formulario de contacto.')}>
                Enviar Mensaje
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
