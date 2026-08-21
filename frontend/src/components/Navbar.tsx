'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-slate-900/95 border-b border-yellow-500/20 py-4 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link 
          href="/products" 
          className="font-black text-2xl text-yellow-400 tracking-wider hover:opacity-90 transition font-rajdhani"
        >
          GameStore
        </Link>
        <div>
          {isAuthenticated ? (
            <button 
              onClick={logout} 
              className="font-orbitron text-xs font-semibold text-white hover:text-slate-300 transition uppercase tracking-wider bg-slate-700/40 border border-slate-500/30 px-3 py-1.5 rounded cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <Link 
              href="/login" 
              className="font-orbitron text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition uppercase tracking-wider bg-yellow-950/40 border border-yellow-500/30 px-3 py-1.5 rounded"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}