'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await api.post(endpoint, { email, password });
      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas o error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/google', { credential: credentialResponse.credential });
      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/');
      }
    } catch (err: any) {
      setError('Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md bg-card dark:bg-[#121212] p-8 rounded-xl border border-border shadow-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          {mounted ? (
            <img 
              src={theme === 'dark' ? '/astra_logo_light.png' : '/astra_logo_dark.png'} 
              alt="ASTRA Logo" 
              className="w-auto h-24 object-contain mb-2 rounded-4xl" 
            />
          ) : (
            <div className="w-16 h-16 rounded bg-muted animate-pulse mb-2"></div>
          )}
          <h2 className="text-xl font-semibold mt-4 text-card-foreground">
            {isRegister ? 'Crear una cuenta' : 'Inicia Sesión'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isRegister ? 'Registrate para continuar' : 'Ingresa a tu cuenta para continuar'}
          </p>
        </div>

        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
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
          
          <div className="flex items-center justify-between pt-2">
            {!isRegister && (
              <div className="text-sm">
                <a href="#" className="text-slate-600 hover:underline">¿Olvidaste tu contraseña?</a>
              </div>
            )}
          </div>

          {!isRegister && (
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="font-normal text-slate-600">Mantener sesión iniciada</Label>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full mt-2 bg-slate-500 hover:bg-slate-600 text-white">
            {loading ? 'Procesando...' : (isRegister ? 'Registrarse' : 'Ingresar')}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Fallo el inicio de sesión con Google')}
                useOneTap
              />
            </GoogleOAuthProvider>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}{' '}
          <button 
            type="button" 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-primary hover:underline font-medium"
          >
            {isRegister ? 'Inicia Sesión' : 'Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
