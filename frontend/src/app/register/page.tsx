'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/auth/register', {
        username,
        email,
        password,
      });

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-screen m-0 p-4 flex items-center justify-center bg-cover bg-center bg-no-repeat fixed inset-0 overflow-y-auto"
      style={{ backgroundImage: "url('/wallpaper.jpg')" }}
    >
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs" />

      <div className="relative z-10 w-full max-w-md p-6 bg-slate-900/90 rounded-lg shadow-xl border border-purple-900/50 my-auto">
        <h2 className="text-2xl font-bold mb-2 text-center text-white">Create Account</h2>
        <p className="text-sm text-indigo-300 text-center mb-6">
          Sign up to start purchasing digital games
        </p>

        {error && (
          <div className="bg-red-950/50 border border-red-800/60 text-red-300 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Username</label>
            <input
              type="text"
              placeholder="Choose a username"
              className="w-full bg-slate-950 border border-indigo-900/60 p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-slate-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-slate-950 border border-indigo-900/60 p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder-slate-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded transition font-medium disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}