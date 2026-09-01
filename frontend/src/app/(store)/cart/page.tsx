'use client';

import React, { useState } from 'react';
import { useCart } from '@/components/shared/CartProvider';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Suspense } from 'react';

function CartContent() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'mercadopago'>('stripe');
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (searchParams.get('success') === 'true') {
      clearCart();
      setIsSuccessOpen(true);
      // Opcionalmente limpiar la URL
      router.replace('/cart');
    }
    if (searchParams.get('canceled') === 'true') {
      alert('El pago fue cancelado. Puedes intentar de nuevo.');
      router.replace('/cart');
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setIsAlertOpen(true);
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(userStr);
      const res = await api.post('/sales', {
        clientName: user.email.split('@')[0],
        clientEmail: user.email,
        userId: user.id,
        paymentMethod,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, name: i.name }))
      });
      
      if (res.data && res.data.url) {
        window.location.href = res.data.url; // Redirect to Stripe
      } else {
        clearCart();
        setIsSuccessOpen(true);
      }
    } catch (error) {
      alert('Hubo un error al procesar tu compra.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setIsAlertOpen(false);
    router.push('/login');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold">Tu carrito está vacío</h2>
        <p className="mt-2 text-sm">Explora nuestros productos y añade algo a tu carrito.</p>
        <Button className="mt-6 bg-slate-500 hover:bg-slate-600 text-white" onClick={() => router.push('/products')}>Ver Productos</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Tu Carrito de Compras</h1>
      
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-border">
          {items.map(item => (
            <div key={item.productId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-4">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-border" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-xs text-slate-400 border border-border">S/I</div>
                )}
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                  <p className="text-primary font-medium mt-1">${item.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2 bg-muted rounded-md p-1">
                  <button 
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="p-1 hover:bg-background rounded text-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="p-1 hover:bg-background rounded text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="w-24 text-right font-bold text-foreground">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-muted/50 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm text-muted-foreground">Total a pagar</p>
            <p className="text-3xl font-bold text-foreground">${total.toFixed(2)}</p>
          </div>

          <div className="flex flex-col gap-3 bg-background p-4 rounded-lg border border-border shadow-sm w-full md:w-auto">
            <span className="text-sm font-semibold text-foreground border-b border-border pb-1">Método de Pago:</span>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="paymentMethod" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="w-4 h-4 text-primary accent-primary" />
                <span className="text-sm font-medium group-hover:text-primary transition-colors">Stripe (Tarjetas)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="paymentMethod" value="mercadopago" checked={paymentMethod === 'mercadopago'} onChange={() => setPaymentMethod('mercadopago')} className="w-4 h-4 text-primary accent-primary" />
                <span className="text-sm font-medium group-hover:text-primary transition-colors">MercadoPago (Tarjetas / Saldo)</span>
              </label>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full md:w-auto bg-slate-600 hover:bg-slate-700 text-white font-semibold h-14 px-8 text-lg rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Comprar Ahora'}
          </Button>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Espera un momento!</AlertDialogTitle>
            <AlertDialogDescription>
              Necesitas iniciar sesión para poder finalizar tu compra. No te preocupes, los productos de tu carrito no se perderán si vas a iniciar sesión ahora.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={goToLogin} className="bg-slate-600 hover:bg-slate-700 text-white">
              Proceder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Compra Realizada!</AlertDialogTitle>
            <AlertDialogDescription>
              Tu compra ha sido procesada correctamente. Podrás ver el detalle en la sección "Mis Compras".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setIsSuccessOpen(false); router.push('/my-purchases'); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando carrito...</div>}>
      <CartContent />
    </Suspense>
  );
}
