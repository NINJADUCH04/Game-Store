'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  created_at?: string;
}

export default function GameDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (err: any) {
        setError('Unable to load game details or game does not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handlePurchase = async () => {
    setPurchasing(true);
    setError('');

    try {
      const response = await api.post('/api/orders', {
        product_id: Number(id),
      });

      router.push(`/receipt/${response.data.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Purchase failed. Please ensure you are logged in.'
      );
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0f1d] text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-xs font-orbitron text-cyan-400 hover:text-cyan-300 transition tracking-wider"
          >
            ← BACK TO CATALOG
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-24 text-cyan-400 font-orbitron text-lg animate-pulse tracking-widest">
            RETRIEVING GAME SPECIFICATIONS...
          </div>
        ) : error && !product ? (
          <div className="bg-red-950/50 border border-red-800/60 text-red-300 p-6 rounded-2xl text-center font-medium">
            {error}
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-orbitron font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 rounded-md uppercase tracking-wider">
                    {product?.location || 'GLOBAL REGION'}
                  </span>
                  <span className="text-xs font-orbitron text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 rounded-md uppercase tracking-wider">
                    INSTANT DIGITAL DELIVERY
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black font-orbitron text-white tracking-wide mb-4">
                  {product?.title}
                </h1>

                <div className="bg-slate-950/70 rounded-xl p-5 border border-slate-800 mb-6">
                  <h3 className="text-xs font-orbitron text-slate-400 uppercase tracking-widest mb-2">
                    OVERVIEW & DETAILS
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {product?.description || 'No extended description provided for this game title.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-orbitron text-slate-400">
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                    <span className="block text-slate-500 mb-1">PLATFORM</span>
                    <strong className="text-white">PC / DIGITAL KEY</strong>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                    <span className="block text-slate-500 mb-1">ACTIVATION</span>
                    <strong className="text-cyan-400">AUTOMATIC CODE</strong>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 flex flex-col justify-between bg-slate-950/80 p-6 rounded-xl border border-slate-800 h-fit">
                <div>
                  <span className="text-xs font-orbitron text-slate-400 block mb-1">PRICE</span>
                  <div className="text-3xl font-black font-orbitron text-cyan-400 mb-6">
                    ${product?.price.toFixed(2)}
                  </div>

                  {error && (
                    <div className="bg-red-950/60 border border-red-500/50 text-red-300 p-3 rounded mb-4 text-xs text-center">
                      {error}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron text-xs font-bold py-3.5 rounded-xl transition uppercase tracking-wider block shadow-lg shadow-cyan-950/50 cursor-pointer disabled:opacity-50"
                  >
                    {purchasing ? 'PROCESSING ORDER...' : 'BUY NOW'}
                  </button>

                  <p className="text-[10px] text-center text-slate-500 font-orbitron uppercase tracking-widest">
                    🔒 Secure SSL Activation
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}