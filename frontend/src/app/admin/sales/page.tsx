'use client';

import React, { useState, useEffect } from 'react';
import { GenericTable, ColumnDef } from '@/components/shared/GenericTable';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSales = async () => {
    try {
      const res = await api.get('/sales');
      setSales(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleGenerateSale = async () => {
    try {
      await api.post('/sales');
      fetchSales();
    } catch (error) {
      console.error(error);
    }
  };

  const handleView = (row: any) => {
    setSelectedSale(row);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<any>[] = [
    { 
      key: 'client', 
      header: 'Cliente',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium">
            {row.clientName.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-slate-900">{row.clientName}</div>
            <div className="text-xs text-slate-500">{row.clientEmail}</div>
          </div>
        </div>
      )
    },
    { key: 'orderNumber', header: 'Número de Orden', render: (row) => <span className="font-mono text-sm">{row.orderNumber}</span> },
    { key: 'status', header: 'Estado', render: (row) => (
      <Badge variant="secondary" className={
        row.status === 'Enviado' ? 'bg-blue-50 text-blue-700' :
        row.status === 'En Preparación' ? 'bg-orange-50 text-orange-700' :
        'bg-red-50 text-red-700'
      }>
        {row.status}
      </Badge>
    )},
    { key: 'total', header: 'Total', render: (row) => <span className="font-medium">${row.total.toFixed(2)}</span> },
    { key: 'paymentStatus', header: 'Pago', render: (row) => (
      <Badge className={row.paymentStatus === 'Pagado' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'}>
        {row.paymentStatus}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
        <Button onClick={handleGenerateSale} className="bg-slate-900">
          + Generar Venta
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="mb-4 max-w-md">
          <Input placeholder="Buscar por nombre o número de orden..." />
        </div>
        <GenericTable 
          columns={columns} 
          data={sales} 
          onView={handleView}
          onEdit={handleView} // Both open the same modal for this simple test
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Gestionar Orden <span className="text-slate-500 font-normal">#{selectedSale?.orderNumber}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-6 pt-4">
              <div className="bg-slate-50 p-4 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Estado Actual:</span>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">{selectedSale.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-4 border-b pb-2">Información del Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">Nombre:</span> {selectedSale.clientName}</p>
                    <p><span className="text-slate-500">Email:</span> {selectedSale.clientEmail}</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-4 border-b pb-2">Información de Pago</h3>
                  <div className="space-y-2 text-sm flex justify-between">
                    <div>
                      <p className="text-slate-500 mb-1">Total</p>
                      <p className="text-lg font-bold">${selectedSale.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Estado</p>
                      <Badge className="bg-slate-900">{selectedSale.paymentStatus}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button className="bg-slate-900">Completar Pedido</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
