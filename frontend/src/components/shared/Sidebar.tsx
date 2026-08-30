import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Tags, Package, Users, BarChart3, Settings, HelpCircle, Bell, Sun, Moon, UserCircle } from 'lucide-react';
import { useTheme } from 'next-themes';

const sidebarItems = [
  { name: 'Inicio', href: '/admin', icon: LayoutDashboard },
  { name: 'Ventas', href: '/admin/sales', icon: ShoppingCart },
  { name: 'Categorías', href: '/admin/categories', icon: Tags },
  { name: 'Marcas', href: '/admin/brands', icon: Tags },
  { name: 'Productos', href: '/admin/products', icon: Package },
  { name: 'Clientes', href: '/admin/clients', icon: Users },
  { name: 'Estadísticas', href: '/admin/stats', icon: BarChart3 },
];

const bottomItems = [
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
  { name: 'Ayuda', href: '/admin/help', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border space-x-3">
        <img src="/astra_logo.jfif" alt="ASTRA Logo" className="w-8 h-8 object-cover rounded-full" />
        <h1 className="font-bold text-xl text-primary tracking-wider">ASTRA</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{item.name}</span>
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
  
  // Generar un breadcrumb simple
  const paths = pathname.split('/').filter(p => p !== '');
  const breadcrumb = paths.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="text-sm font-medium text-muted-foreground">
        {breadcrumb || 'Inicio'}
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground cursor-pointer">
          <UserCircle className="w-6 h-6" />
        </div>
      </div>
    </header>
  );
}
