'use client';

import React, { useState, useEffect } from 'react';
import { GenericTable, ColumnDef } from '@/components/shared/GenericTable';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', position: 1, parentId: '' });
  const [userRole, setUserRole] = useState('USER');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
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
      name: formData.name,
      position: Number(formData.position),
      parentId: formData.parentId ? Number(formData.parentId) : undefined,
    };
    try {
      if (formData.id) {
        await api.patch(`/categories/${formData.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (row: any) => {
    setFormData({ id: row.id, name: row.name, position: row.position, parentId: row.parentId?.toString() || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await api.delete(`/categories/${row.id}`);
        fetchCategories();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const columns: ColumnDef<any>[] = [
    { key: 'position', header: 'Posición' },
    { key: 'name', header: 'Nombre' },
    { 
      key: 'subcategories', 
      header: 'Subcategorías',
      render: (row) => <span className="text-sm text-slate-500">{row.subcategories?.length || 0} subcategorías</span>
    },
    { 
      key: 'parentId', 
      header: 'Categoría Padre',
      render: (row) => row.parent ? (
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">{row.parent.name}</span>
      ) : (
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">Principal</span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categorías</h1>
        {(userRole === 'ADMIN' || userRole === 'SUPERADMIN') && (
          <Button onClick={() => { setFormData({ id: null, name: '', position: 1, parentId: '' }); setIsModalOpen(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            + Nueva Categoría
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="mb-4 w-72">
          <Input placeholder="Buscar por nombre..." />
        </div>
        <GenericTable 
          columns={columns} 
          data={categories} 
          onEdit={(userRole === 'ADMIN' || userRole === 'SUPERADMIN') ? handleEdit : undefined} 
          onDelete={(userRole === 'ADMIN' || userRole === 'SUPERADMIN') ? handleDelete : undefined} 
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría Padre</Label>
              <Select value={formData.parentId || ''} onValueChange={(val) => setFormData({ ...formData, parentId: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Principal (sin padre)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Principal (sin padre)</SelectItem>
                  {categories.filter(c => c.id !== formData.id).map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Posición</Label>
              <Input 
                type="number" 
                value={formData.position} 
                onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })} 
                required 
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">{formData.id ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
