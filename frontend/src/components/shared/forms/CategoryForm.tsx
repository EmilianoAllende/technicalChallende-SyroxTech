import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const DEFAULT_FORM = { id: null, name: '', position: 1, parentId: '' };

export function CategoryForm({ isOpen, onClose, onSuccess, initialData }: CategoryFormProps) {
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
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{formData.id ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              required 
            />
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
