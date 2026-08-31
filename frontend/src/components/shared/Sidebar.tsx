'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Tags, Package, Users, BarChart3, Settings, HelpCircle, Bell, Sun, Moon, UserCircle, LogOut, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { useCart } from './CartProvider';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const baseItems = [
  { name: 'Inicio', href: '/', icon: LayoutDashboard },
  { name: 'Categorías', href: '/categories', icon: Tags },
  { name: 'Marcas', href: '/brands', icon: Tags },
  { name: 'Productos', href: '/products', icon: Package },
  { name: 'Carrito', href: '/cart', icon: ShoppingCart },
];

const bottomItems = [
  { name: 'Configuración', href: '/settings', icon: Settings },
  { name: 'Ayuda', href: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { items: cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  React.useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {}
    }
  }, []);

  const items = [...baseItems];
  if (userRole) {
    items.push({ name: 'Mis Compras', href: '/my-purchases', icon: Package });
  }
  if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
    items.push({ name: 'Ventas', href: '/sales', icon: ShoppingCart });
    items.push({ name: 'Estadísticas', href: '/stats', icon: BarChart3 });
  }
  if (userRole === 'SUPERADMIN') {
    items.push({ name: 'Usuarios', href: '/users', icon: Users });
  }

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border space-x-3">
        {mounted ? (
          <img 
            src={theme === 'dark' ? '/astra_logo_light.png' : '/astra_logo_dark.png'} 
            alt="ASTRA Logo" 
            className="w-auto h-14 object-contain" 
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-100 text-slate-900 font-medium dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {item.name === 'Carrito' && cartCount > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t">
        <nav className="space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <item.icon className="w-5 h-5 text-slate-400" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {}
    }
  }, []);

  const paths = pathname.split('/').filter(p => p !== '');
  const breadcrumb = paths.map(p => {
    if (p === 'admin') return 'Panel';
    return p.charAt(0).toUpperCase() + p.slice(1);
  }).join(' / ');

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [canConfirm, setCanConfirm] = React.useState(false);
  const [countdown, setCountdown] = React.useState(3);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/products`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleOpenAlert = () => {
    setIsAlertOpen(true);
    setCanConfirm(false);
    setCountdown(3);
  };

  React.useEffect(() => {
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
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user && user.id) {
        await api.delete(`/users/${user.id}`);
        handleLogout();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar cuenta');
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 flex items-center space-x-4">
        <div className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:block">
          {breadcrumb || 'Inicio'}
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Buscar productos por nombre..." 
            className="w-full pl-9 bg-background" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center space-x-4 ml-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted"
        >
          {mounted ? (
            theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
          ) : (
            <div className="w-5 h-5" />
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground cursor-pointer transition-transform hover:scale-105">
              <UserCircle className="w-6 h-6" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
              {userRole ? `Mi Cuenta (${userRole})` : 'Invitado'}
            </div>
            <DropdownMenuSeparator />
            {userRole ? (
              <>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenAlert} className="cursor-pointer text-red-600 focus:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span>Eliminar cuenta</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => router.push('/login')} className="cursor-pointer">
                <UserCircle className="w-4 h-4 mr-2" />
                <span>Iniciar sesión</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta y removerá tus datos de nuestros servidores.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>NO</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDeleteAccount();
            }} 
            disabled={!canConfirm || isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Eliminando...' : canConfirm ? 'SI' : `SI (${countdown})`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
