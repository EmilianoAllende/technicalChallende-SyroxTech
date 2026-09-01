import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md w-full text-center space-y-6 flex flex-col items-center">
        {/* Imagen 404 */}
        <div className="relative w-full max-w-[280px] aspect-square rounded-full overflow-hidden shadow-2xl border-8 border-muted/30 mb-2">
          <img 
            src="/astra-404.jfif" 
            alt="404 - No Encontrado" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-7xl font-extrabold tracking-tighter text-primary">404</h1>
          <h2 className="text-2xl font-bold tracking-tight">¡Oops! Te has perdido en el espacio.</h2>
          <p className="text-muted-foreground">
            La página que buscas no existe, ha sido movida o simplemente se desvaneció en el cosmos de ASTRA.
          </p>
        </div>

        <Link href="/">
          <Button size="lg" className="mt-6 gap-2 h-12 px-8 text-md rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95">
            <Home className="w-5 h-5" />
            Volver a la Base
          </Button>
        </Link>
      </div>
    </div>
  );
}
