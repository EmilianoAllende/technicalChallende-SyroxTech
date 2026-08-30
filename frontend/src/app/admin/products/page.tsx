'use client';

import React, { useState, useEffect } from 'react';
import { GenericTable, ColumnDef } from '@/components/shared/GenericTable';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    id: null, name: '', description: '', gender: '', brand: '', price: 0, categoryId: '' 
  });
  const [userRole, setUserRole] = useState('USER');

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {}
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      categoryId: Number(formData.categoryId)
    };
    try {
      if (formData.id) {
        await api.patch(`/products/${formData.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (row: any) => {
    setFormData({ 
      id: row.id, 
      name: row.name, 
      description: row.description || '', 
      gender: row.gender || '', 
      brand: row.brand || '', 
      price: row.price || 0,
      categoryId: row.categoryId?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await api.delete(`/products/${row.id}`);
        fetchData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const columns: ColumnDef<any>[] = [
    { key: 'name', header: 'Nombre', render: (row) => <div className="font-medium text-slate-900">{row.name}</div> },
    { key: 'category', header: 'Categoría', render: (row) => row.category?.name || '-' },
    { key: 'brand', header: 'Marca', render: (row) => row.brand || '-' },
    { key: 'price', header: 'Precio', render: (row) => `$${row.price}` },
    { key: 'isActive', header: 'Estado', render: (row) => (
      <Badge variant="outline" className={row.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
        {row.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
        <div className="space-x-3">
          <Button variant="outline">Importar Productos</Button>
          {userRole === 'ADMIN' && (
            <Button onClick={() => { setFormData({ id: null, name: '', description: '', gender: '', brand: '', price: 0, categoryId: '' }); setIsModalOpen(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              + Nuevo Producto
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="mb-4 flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <Input placeholder="Buscar productos por nombre..." />
          </div>
          <Button variant="outline">Filtros</Button>
        </div>
        <GenericTable 
          columns={columns} 
          data={products} 
          onEdit={userRole === 'ADMIN' ? handleEdit : undefined} 
          onDelete={userRole === 'ADMIN' ? handleDelete : undefined} 
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Producto' : 'Crear Producto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nombre del Producto *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Descripción</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={formData.categoryId || ''} onValueChange={(val) => setFormData({ ...formData, categoryId: val })} required>
                  <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Género</Label>
                <Select value={formData.gender || ''} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un género" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hombre">Hombre</SelectItem>
                    <SelectItem value="Mujer">Mujer</SelectItem>
                    <SelectItem value="Unisex">Unisex</SelectItem>
                    <SelectItem value="Niño">Niño</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Precio</Label>
                <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-border mt-6">
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{formData.id ? 'Guardar Cambios' : 'Crear Producto'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
