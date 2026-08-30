'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/admin');
      }
    } catch (err) {
      setError('Credenciales inválidas o error de conexión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-2 border-primary">
            <img src="/astra_logo.jfif" alt="ASTRA Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-widest">
            ASTRA
          </h1>
          <h2 className="text-xl font-semibold mt-4 text-card-foreground">Inicia Sesión</h2>
          <p className="text-muted-foreground text-sm mt-1">Ingresa a tu cuenta para continuar</p>
        </div>

        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="ejemplo@mail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="text-slate-600 hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="font-normal text-slate-600">Mantener sesión iniciada</Label>
          </div>

          <Button type="submit" className="w-full mt-2 bg-slate-500 hover:bg-slate-600 text-white">
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}
