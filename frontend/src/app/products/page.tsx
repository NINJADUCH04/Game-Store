'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState<string>('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?page=${page}&page_size=${pageSize}`;
        if (location) url += `&location=${location}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        
        const res = await api.get(url);
        
        if (res.data.items) {
          setProducts(res.data.items);
          setTotalPages(res.data.total_pages || Math.ceil(res.data.total / pageSize) || 1);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, location, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed text-slate-100 flex flex-col" style={{ backgroundImage: "url('/products-wallpaper.jpg')" }}>
      <div className="min-h-screen bg-slate-950/80 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Banner Section */}
        <div className="mb-8 p-6 sm:p-8 bg-slate-900/90 rounded-2xl border border-purple-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10">
            <h1 className="text-3xl font-black font-orbitron text-white tracking-wide mb-2">
              CATALOG & STOREFRONT
            </h1>
            <p className="text-slate-400 text-sm max-w-lg">
              Explore instant-activation keys, digital expansions, and regional codes.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative z-10 w-full md:w-72">
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-slate-950 border border-purple-500/30 text-white placeholder-slate-500 px-4 py-2.5 rounded-xl outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition text-sm"
            />
          </div>

          {/* Location Filter */}
          <div className="relative z-10 flex gap-2">
            <button
              onClick={() => handleLocationChange('')}
              className={`font-orbitron text-xs font-bold px-4 py-2 rounded-xl transition uppercase tracking-wider cursor-pointer ${
                location === ''
                  ? 'bg-indigo-600 text-white border border-indigo-500'
                  : 'bg-slate-950 text-slate-400 border border-slate-700 hover:border-purple-500/50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleLocationChange('JO')}
              className={`font-orbitron text-xs font-bold px-4 py-2 rounded-xl transition uppercase tracking-wider cursor-pointer ${
                location === 'JO'
                  ? 'bg-indigo-600 text-white border border-indigo-500'
                  : 'bg-slate-950 text-slate-400 border border-slate-700 hover:border-purple-500/50'
              }`}
            >
              JO
            </button>
            <button
              onClick={() => handleLocationChange('SA')}
              className={`font-orbitron text-xs font-bold px-4 py-2 rounded-xl transition uppercase tracking-wider cursor-pointer ${
                location === 'SA'
                  ? 'bg-indigo-600 text-white border border-indigo-500'
                  : 'bg-slate-950 text-slate-400 border border-slate-700 hover:border-purple-500/50'
              }`}
            >
              SA
            </button>
          </div>

          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-24 text-purple-400 font-orbitron text-lg animate-pulse tracking-widest">
            LOADING GAME VAULT...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400 font-medium">No games found on this page.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {products.map((game) => (
                <div
                  key={game.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-950/40 group relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-orbitron font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        game.location === 'JO'
                          ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30'
                          : game.location === 'SA'
                          ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30'
                          : 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30'
                      }`}>
                        {game.location || 'GLOBAL'}
                      </span>
                      <span className="text-lg font-black font-orbitron text-yellow-400">
                        ${game.price.toFixed(2)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 line-clamp-1 font-orbitron group-hover:text-purple-300 transition">
                      {game.title}
                    </h3>

                    <p className="text-slate-400 text-xs line-clamp-3 mb-5 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                      {game.description || 'No description provided.'}
                    </p>
                  </div>

                  <Link
                    href={`/products/${game.id}`}
                    className="w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-orbitron text-xs font-bold py-2.5 rounded-xl transition uppercase tracking-wider block shadow-md shadow-purple-950/50 cursor-pointer"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-10 flex items-center justify-center space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="font-orbitron text-xs font-bold px-4 py-2 rounded-lg bg-slate-900 border border-purple-500/30 text-purple-400 hover:bg-purple-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← PREV
              </button>

              <span className="font-orbitron text-xs text-slate-400">
                PAGE <strong className="text-purple-400">{page}</strong> OF <strong className="text-white">{totalPages}</strong>
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="font-orbitron text-xs font-bold px-4 py-2 rounded-lg bg-slate-900 border border-purple-500/30 text-purple-400 hover:bg-purple-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                NEXT →
              </button>
            </div>
          </>
        )}
      </main>
      </div>
    </div>
  );
}
