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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {}
    }
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
    setSelectedSale({ ...row });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSale) return;
    setIsSaving(true);
    try {
      await api.patch(`/sales/${selectedSale.id}`, {
        status: selectedSale.status,
        paymentStatus: selectedSale.paymentStatus
      });
      setIsModalOpen(false);
      fetchSales();
    } catch (error) {
      alert('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
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
    { key: 'status', header: 'Logística', render: (row) => (
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
      <Badge className={
        row.paymentStatus === 'Pagado' ? 'bg-green-100 text-green-800' : 
        row.paymentStatus === 'Rechazado' ? 'bg-red-100 text-red-800' : 
        'bg-yellow-100 text-yellow-800'
      }>
        {row.paymentStatus}
      </Badge>
    )},
  ];

  const canEdit = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Ventas</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="mb-4 max-w-md">
          <Input placeholder="Buscar por nombre o número de orden..." />
        </div>
        <GenericTable 
          columns={columns} 
          data={sales} 
          onView={handleView}
          onEdit={handleView}
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Bloque Financiero */}
                <div className="border border-slate-200 rounded-xl p-5 shadow-sm bg-slate-50">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    Información Financiera (Pago)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Monto Total</p>
                      <p className="text-2xl font-bold text-slate-900">${selectedSale.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Estado del Pago</p>
                      {canEdit ? (
                        <select 
                          className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          value={selectedSale.paymentStatus}
                          onChange={(e) => setSelectedSale({...selectedSale, paymentStatus: e.target.value})}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Pagado">Pagado</option>
                          <option value="Rechazado">Rechazado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      ) : (
                        <Badge className={
                          selectedSale.paymentStatus === 'Pagado' ? 'bg-green-100 text-green-800' : 
                          selectedSale.paymentStatus === 'Rechazado' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {selectedSale.paymentStatus}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bloque Operativo */}
                <div className="border border-slate-200 rounded-xl p-5 shadow-sm bg-slate-50">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    Logística y Productos
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Cliente</p>
                      <p className="font-medium text-slate-900">{selectedSale.clientName}</p>
                      <p className="text-sm text-slate-500">{selectedSale.clientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Estado de Preparación</p>
                      {canEdit ? (
                        <select 
                          className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          value={selectedSale.status}
                          onChange={(e) => setSelectedSale({...selectedSale, status: e.target.value})}
                        >
                          <option value="En Preparación">En Preparación</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Completado">Completado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          {selectedSale.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {canEdit && (
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <Button onClick={handleSave} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
