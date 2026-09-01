'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Tags, Package, Users, BarChart3, Settings, HelpCircle, Bell, Sun, Moon, UserCircle, LogOut, Trash2, Menu, UserCog } from 'lucide-react';
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
  { name: 'Productos', href: '/products', icon: Package },
  { name: 'Carrito', href: '/cart', icon: ShoppingCart },
];

const bottomItems = [
  { name: 'Cuenta', href: '/account', icon: UserCog },
  { name: 'Ayuda', href: '/help', icon: HelpCircle },
];

export function Sidebar({ isOpen = true }: { isOpen?: boolean }) {
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
    items.push({ name: 'Categorías', href: '/categories', icon: Tags });
    items.push({ name: 'Marcas', href: '/brands', icon: Tags });
    items.push({ name: 'Ventas', href: '/sales', icon: ShoppingCart });
    items.push({ name: 'Estadísticas', href: '/stats', icon: BarChart3 });
  }
  if (userRole === 'SUPERADMIN') {
    items.push({ name: 'Usuarios', href: '/users', icon: Users });
  }

  return (
    <aside className={`h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 transition-all duration-300 ease-in-out z-20 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="h-16 flex items-center justify-center border-b border-border">
        {mounted ? (
          isOpen ? (
            <img 
              src={theme === 'dark' ? '/astra_logo_light.png' : '/astra_logo_dark.png'} 
              alt="ASTRA Logo" 
              className="w-auto h-14 object-contain px-2" 
            />
          ) : (
             <div className="font-bold text-3xl tracking-tighter text-primary">A</div>
          )
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <nav className="space-y-2 px-3">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg transition-colors ${
                  isOpen ? 'px-3 py-2.5 space-x-3' : 'justify-center p-3 relative'
                } ${
                  isActive ? 'bg-slate-100 text-slate-900 font-medium dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
                title={!isOpen ? item.name : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
                {isOpen && <span>{item.name}</span>}
                {isOpen && item.name === 'Carrito' && cartCount > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
                {!isOpen && item.name === 'Carrito' && cartCount > 0 && (
                   <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t">
        <nav className="space-y-2">
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors ${
                isOpen ? 'px-3 py-2 space-x-3' : 'justify-center p-3 relative'
              }`}
              title={!isOpen ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0 text-slate-400" />
              {isOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
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

  return (
    <>
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 transition-all">
      <div className="flex-1 flex items-center space-x-4">
        {toggleSidebar && (
          <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        )}
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
    </>
  );
}
