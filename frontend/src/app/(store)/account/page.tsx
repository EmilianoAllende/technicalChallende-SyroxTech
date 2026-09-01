'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserCircle, Trash2, Save, Camera } from 'lucide-react';
import { Suspense } from 'react';

function AccountContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    avatarUrl: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  // States for Danger Zone
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [canConfirm, setCanConfirm] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/login');
        return;
      }
      const localUser = JSON.parse(userStr);
      const res = await api.get(`/users/${localUser.id}`);
      setUser(res.data);
      setFormData({
        username: res.data.username || '',
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        birthDate: res.data.birthDate ? new Date(res.data.birthDate).toISOString().split('T')[0] : '',
        avatarUrl: res.data.avatarUrl || ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch(`/users/${user.id}`, {
        username: formData.username || undefined,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        birthDate: formData.birthDate || undefined,
        avatarUrl: formData.avatarUrl || undefined,
      });
      alert('Perfil actualizado con éxito');
      fetchProfile();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAlert = () => {
    setIsAlertOpen(true);
    setCanConfirm(false);
    setCountdown(3);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAlertOpen && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (isAlertOpen && countdown === 0) {
      setCanConfirm(true);
    }
    return () => clearTimeout(timer);
  }, [isAlertOpen, countdown]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/users/${user.id}`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar cuenta');
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-muted-foreground">Cargando perfil...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mi Cuenta</h1>
        <p className="text-muted-foreground mt-1">Administra tu información personal y la configuración de tu cuenta.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center border-4 border-background shadow-sm">
                  <UserCircle className="w-12 h-12" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{formData.firstName || user.email} {formData.lastName}</h2>
              <p className="text-muted-foreground">{user.role}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input id="username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="johndoe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico (No editable)</Label>
                <Input id="email" value={user.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">URL de Imagen de Perfil</Label>
                <Input id="avatarUrl" value={formData.avatarUrl} onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})} placeholder="https://..." />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded-xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Zona de Peligro</h3>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1 mb-4">
            Una vez que eliminas tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar seguro.
          </p>
          <Button variant="destructive" onClick={handleOpenAlert}>
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar mi cuenta
          </Button>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y removerá tus datos de nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }} 
              disabled={!canConfirm || isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Eliminando...' : canConfirm ? 'Sí, eliminar cuenta' : `Sí, eliminar cuenta (${countdown})`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <AccountContent />
    </Suspense>
  );
}
