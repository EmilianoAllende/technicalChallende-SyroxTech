import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="max-w-4xl w-full flex flex-col items-center">
        {/* Imagen 404 (Completa, sin recortes) */}
        <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl mb-8 border border-muted">
          <img 
            src="/astra-404.jfif" 
            alt="404 - Página no encontrada" 
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Botón para volver */}
        <Link href="/">
          <Button size="lg" className="gap-2 h-14 px-10 text-lg rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Home className="w-6 h-6" />
            Volver a la Base
          </Button>
        </Link>
      </div>
    </div>
  );
}
