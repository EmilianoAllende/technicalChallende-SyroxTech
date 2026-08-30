import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Inventario de Productos */}
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Inventario de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">128</div>
          <p className="text-xs text-slate-500 mb-4">Valor: $190,192.00</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="truncate pr-4 text-slate-700">Tenis Adidas VL Court Base - ID3715</span>
              <span className="font-medium">2 uds.</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b pb-2">
              <span className="truncate pr-4 text-slate-700">Zapatillas Adidas Grand Court</span>
              <span className="font-medium">2 uds.</span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <Button className="bg-slate-900">+ Añadir</Button>
            <Button variant="outline">Ver Todos</Button>
          </div>
        </CardContent>
      </Card>

      {/* Ventas Recientes */}
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900">Jaime González</p>
                  <p className="text-xs text-slate-500">Order #AB1850E7 - Status: SHIPPED</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">$99.00</p>
                  <p className="text-xs text-slate-400">18-ago 2025</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productos Top */}
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-sm text-slate-500">
            No hay productos top para mostrar.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
