'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-slate-900/95 border-b border-cyan-500/20 py-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link 
          href="/products" 
          className="font-black font-orbitron text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-yellow-400 tracking-wider hover:opacity-90 transition"
        >
          GameStore
        </Link>
        <div>
          {isAuthenticated ? (
            <button 
              onClick={logout} 
              className="font-orbitron text-xs font-semibold text-rose-400 hover:text-rose-300 transition uppercase tracking-wider bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 rounded cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <Link 
              href="/login" 
              className="font-orbitron text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition uppercase tracking-wider bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}