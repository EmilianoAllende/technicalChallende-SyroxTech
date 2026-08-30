'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    
    const fetchPurchases = async () => {
      try {
        const user = JSON.parse(userStr);
        const res = await api.get(`/sales/my-purchases?userId=${user.id}`);
        setPurchases(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [router]);

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
                  <div>
                    <h4 className="font-medium text-foreground">{item.product?.name || 'Producto Desconocido'}</h4>
                    <p className="text-sm text-muted-foreground mt-1">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
