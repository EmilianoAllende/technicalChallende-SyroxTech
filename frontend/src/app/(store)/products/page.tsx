'use client';

import React, { useState, useEffect } from 'react';
import { GenericTable, ColumnDef } from '@/components/shared/GenericTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ProductForm } from '@/components/shared/forms/ProductForm';
import { useCart } from '@/components/shared/CartProvider';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense } from 'react';

function ProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const [userRole, setUserRole] = useState('USER');
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchFilter = searchParams.get('search')?.toLowerCase() || '';
  const categoryFilter = searchParams.get('category') || '';

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



  const handleEdit = (row: any) => {
    setEditingData({ 
      id: row.id, 
      name: row.name, 
      description: row.description || '', 
      gender: row.gender || '', 
      brand: row.brand || '', 
      price: row.price || 0,
      stock: row.stock || 0,
      categoryId: row.categoryId?.toString() || '',
      imageUrl: row.imageUrl || ''
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
    { key: 'image', header: 'Imagen', render: (row) => (
      row.imageUrl ? (
        <img src={row.imageUrl} alt={row.name} className="w-10 h-10 object-cover rounded-md border border-border" />
      ) : (
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-[10px] text-slate-400 border border-border">S/I</div>
      )
    )},
    { key: 'name', header: 'Nombre', render: (row) => <div className="font-medium text-slate-900 dark:text-slate-100">{row.name}</div> },
    { key: 'category', header: 'Categoría', render: (row) => row.category?.name || '-' },
    { key: 'brand', header: 'Marca', render: (row) => row.brand || '-' },
    { key: 'price', header: 'Precio', render: (row) => `$${row.price}` },
    { key: 'stock', header: 'Stock', render: (row) => (
      <span className={row.stock > 0 ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-red-500 font-bold'}>
        {row.stock}
      </span>
    )},
    { key: 'isActive', header: 'Estado', render: (row) => (
      <Badge variant="outline" className={row.isActive ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-50 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
        {row.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    )},
    { key: 'cart', header: '', render: (row) => (
      <Button 
        size="sm" 
        variant="default"
        className="w-full sm:w-auto"
        onClick={() => addToCart({ productId: row.id, name: row.name, price: row.price, quantity: 1, imageUrl: row.imageUrl })}
        disabled={row.stock <= 0}
      >
        {row.stock > 0 ? 'Añadir al carrito' : 'Agotado'}
      </Button>
    )},
  ];

  const handleCategorySelect = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchFilter);
    const matchesCategory = categoryFilter ? p.categoryId?.toString() === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Productos</h1>
        {(userRole === 'ADMIN' || userRole === 'SUPERADMIN') && (
          <Button onClick={() => { setEditingData(null); setIsModalOpen(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            + Nuevo Producto
          </Button>
        )}
      </div>

      <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-hide">
            <Button 
              variant={!categoryFilter ? "default" : "outline"}
              onClick={() => handleCategorySelect('')}
              size="sm"
              className="rounded-full whitespace-nowrap"
            >
              Todas
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat.id}
                variant={categoryFilter === cat.id.toString() ? "default" : "outline"}
                onClick={() => handleCategorySelect(cat.id.toString())}
                size="sm"
                className="rounded-full whitespace-nowrap"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
        <GenericTable 
          columns={columns} 
          data={filteredProducts} 
          onEdit={(userRole === 'ADMIN' || userRole === 'SUPERADMIN') ? handleEdit : undefined} 
          onDelete={(userRole === 'ADMIN' || userRole === 'SUPERADMIN') ? handleDelete : undefined} 
        />
      </div>

      <ProductForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        categories={categories}
        initialData={editingData}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando productos...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
