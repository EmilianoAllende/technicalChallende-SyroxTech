'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Package, Star, StarHalf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Review State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    
    const fetchPurchases = async () => {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        const res = await api.get(`/sales/my-purchases?userId=${parsedUser.id}`);
        
        // Cargar cuáles productos ya tienen reseña para este usuario
        const salesData = res.data;
        setPurchases(salesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [router]);

  const openReviewModal = (product: any) => {
    setSelectedProduct(product);
    setRating(5);
    setComment('');
    setIsReviewOpen(true);
  };

  const submitReview = async () => {
    if (!user || !selectedProduct) return;
    setIsSubmitting(true);
    try {
      await api.post('/reviews', {
        userId: user.id,
        productId: selectedProduct.id,
        rating,
        comment
      });
      alert('¡Gracias por tu reseña!');
      setIsReviewOpen(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al enviar la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando tus compras...</div>;
  }

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Package className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold">Aún no has realizado compras</h2>
        <p className="mt-2 text-sm">Tus pedidos aparecerán aquí una vez que finalices una compra.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Mis Compras</h1>
      
      <div className="space-y-4">
        {purchases.map((sale) => (
          <div key={sale.id} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pedido realizado</p>
                <p className="font-medium">{new Date(sale.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-medium">${sale.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nº de Orden</p>
                <p className="font-medium">{sale.orderNumber}</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 self-start sm:self-auto">
                {sale.status}
              </Badge>
            </div>
            
            <div className="p-6 divide-y divide-border">
              {sale.items?.map((item: any) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 object-cover rounded-md border border-border" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-[10px] text-slate-400 border border-border">S/I</div>
                    )}
                    <div>
                      <h4 className="font-medium text-foreground">{item.product?.name || 'Producto Desconocido'}</h4>
                      <p className="text-sm text-muted-foreground mt-1">Cantidad: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    {sale.status === 'Completado' && (
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => openReviewModal(item.product)}>
                        <Star className="w-3 h-3 mr-1" /> Calificar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dejar Reseña</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 pt-4">
              <p className="font-medium text-slate-800">{selectedProduct.name}</p>
              
              <div>
                <p className="text-sm text-slate-500 mb-2">Calificación</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Comentario (Opcional)</p>
                <textarea
                  className="w-full border border-slate-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  placeholder="¿Qué te pareció el producto?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={submitReview} disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
