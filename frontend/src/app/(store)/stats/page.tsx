'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

// Colores modernos para el gráfico de dinero
const COLORS = {
  Pagado: '#10b981',     // Emerald 500
  Pendiente: '#f59e0b',  // Amber 500
  Rechazado: '#ef4444',  // Red 500
  Cancelado: '#64748b',  // Slate 500
  Desconocido: '#94a3b8' // Slate 400
};

function StatsContent() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      router.push('/');
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sales/stats/money');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching stats', error);
    } finally {
      setLoading(false);
    }
  };

  const totalMoney = data.reduce((acc, curr) => acc + curr.value, 0);
  const pagadoMoney = data.find(d => d.name === 'Pagado')?.value || 0;

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando estadísticas...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Estadísticas</h1>
        <p className="text-muted-foreground mt-1">Monitorea el rendimiento financiero y logístico de la tienda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjetas de resumen métrico */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Ingresos Totales (Brutos)</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">${totalMoney.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Ingresos Netos (Pagados)</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">${pagadoMoney.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Tasa de Conversión</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {totalMoney > 0 ? ((pagadoMoney / totalMoney) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfico de Distribución Financiera */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Flujo de Dinero</h2>
            <p className="text-sm text-muted-foreground">Distribución de ingresos según el estado de pago.</p>
          </div>
          <div className="p-6 h-[400px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Desconocido} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Monto']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No hay datos financieros disponibles.
              </div>
            )}
          </div>
        </div>

        {/* Espacio reservado para el futuro gráfico de productos físicos */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden opacity-50 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 z-10 flex flex-col items-center justify-center">
             <p className="text-lg font-medium text-slate-500">Próximamente</p>
             <p className="text-sm text-slate-400">Gráfico de logística y productos físicos</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <StatsContent />
    </Suspense>
  );
}
