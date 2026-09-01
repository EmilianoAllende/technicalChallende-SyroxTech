import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: number | null;
  initialData?: any;
}

const DEFAULT_FORM = { id: null, email: '', password: '', role: 'USER' };

export function UserForm({ isOpen, onClose, onSuccess, currentUserId, initialData }: UserFormProps) {
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [initialData, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      email: formData.email,
      role: formData.role,
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (formData.id) {
        await api.patch(`/users/${formData.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar el usuario');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{formData.id ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email"
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label>Contraseña {formData.id && '(Dejar en blanco para no cambiar)'}</Label>
            <Input 
              type="password"
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required={!formData.id}
              minLength={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select 
              value={formData.role} 
              onValueChange={(val) => setFormData({ ...formData, role: val || '' })}
              disabled={formData.id === currentUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="SUPERADMIN">SUPERADMIN</SelectItem>
              </SelectContent>
            </Select>
            {formData.id === currentUserId && (
              <p className="text-xs text-muted-foreground">No puedes modificar tu propio rol por seguridad.</p>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t border-border mt-4">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {formData.id ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
