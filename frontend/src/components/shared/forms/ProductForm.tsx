import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  initialData?: any;
}

const DEFAULT_FORM = { id: null, name: '', description: '', gender: '', brand: '', price: 0, stock: 0, categoryId: '', imageUrl: '' };

export function ProductForm({ isOpen, onClose, onSuccess, categories, initialData }: ProductFormProps) {
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
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      categoryId: Number(formData.categoryId)
    };
    try {
      if (formData.id) {
        await api.patch(`/products/${formData.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            <div className="space-y-2 col-span-2">
              <Label>URL de Imagen</Label>
              <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://ejemplo.com/imagen.jpg" />
            </div>
            <div className="space-y-2">
              <Label>Categoría *</Label>
              <Select value={formData.categoryId || ''} onValueChange={(val) => setFormData({ ...formData, categoryId: val || '' })} required>
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
              <Select value={formData.gender || ''} onValueChange={(val) => setFormData({ ...formData, gender: val || '' })}>
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
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" step="1" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-border mt-6">
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {formData.id ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
