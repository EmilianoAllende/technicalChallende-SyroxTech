'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { UserForm } from '@/components/shared/forms/UserForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'date' | 'alphabetical'>('date');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id);
      } catch (e) {}
    }
  }, []);



  const handleEdit = (user: any) => {
    setEditingData({ id: user.id, email: user.email, password: '', role: user.role });
    setIsModalOpen(true);
  };

  const handleDelete = async (user: any) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/users/${user.id}`);
        fetchUsers();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error al eliminar usuario');
      }
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.email.localeCompare(b.email);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Usuarios</h1>
        <Button onClick={() => { setEditingData(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          + Nuevo Usuario
        </Button>
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input placeholder="Buscar por email..." className="max-w-md" />
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground whitespace-nowrap">Ordenar por:</Label>
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Fecha de Creación</SelectItem>
                <SelectItem value="alphabetical">Alfabético</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Fecha de Registro</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={
                      user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200' :
                      user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(user.createdAt), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => handleEdit(user)} className="text-primary hover:underline text-sm font-medium">Editar</button>
                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:underline text-sm font-medium">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        currentUserId={currentUserId}
        initialData={editingData}
      />
    </div>
  );
}
