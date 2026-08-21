'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
      const response = await api.post('/api/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.access_token) {
        login(response.data.access_token);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md p-6 bg-slate-900/90 rounded-lg shadow-xl border border-purple-900/50 my-auto">
      <h1 className="font-black font-orbitron text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-yellow-400 tracking-wider text-center mb-6">
        GameStore
      </h1>
      <h2 className="text-xl font-bold mb-6 text-center text-white">Sign In</h2>

      {registered && (
        <div className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 p-3 rounded mb-4 text-sm font-medium text-center">
          Account created successfully! Please sign in below.
        </div>
      )}

      {error && (
        <div className="bg-red-950/50 border border-red-800/60 text-red-300 p-3 rounded mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            className="w-full bg-slate-950 border border-indigo-900/60 p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-slate-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-indigo-900/60 p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-slate-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded transition font-medium cursor-pointer"
        >
          Sign In
        </button>
      </form>

      <p className="text-sm text-center text-slate-400 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-purple-400 hover:text-purple-300 hover:underline font-medium">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen w-screen m-0 p-4 flex items-center justify-center bg-cover bg-center bg-no-repeat fixed inset-0 overflow-y-auto"
      style={{ backgroundImage: "url('/wallpaper.jpg')" }}
    >
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs" />
      <Suspense fallback={
        <div className="relative z-10 w-full max-w-md p-6 bg-slate-900/90 rounded-lg shadow-xl border border-purple-900/50 my-auto text-center text-slate-400">
          Loading...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
