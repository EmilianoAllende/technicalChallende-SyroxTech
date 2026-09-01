'use client';

import React, { useState, useEffect } from 'react';
import { GenericTable, ColumnDef } from '@/components/shared/GenericTable';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { CategoryForm } from '@/components/shared/forms/CategoryForm';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
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



  const handleEdit = (row: any) => {
    setEditingData({ id: row.id, name: row.name, position: row.position, parentId: row.parentId?.toString() || '' });
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categorías</h1>
        {(userRole === 'ADMIN' || userRole === 'SUPERADMIN') && (
          <Button onClick={() => { setEditingData(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            + Nueva Categoría
          </Button>
        )}
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
        <GenericTable 
          columns={columns} 
          data={categories} 
          onEdit={(userRole === 'ADMIN' || userRole === 'SUPERADMIN') ? handleEdit : undefined} 
          onDelete={(userRole === 'ADMIN' || userRole === 'SUPERADMIN') ? handleDelete : undefined} 
        />
      </div>

      <CategoryForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchCategories}
        initialData={editingData}
      />
    </div>
  );
}
