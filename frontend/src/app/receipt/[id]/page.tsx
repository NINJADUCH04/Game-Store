'use client';

import { useState, useEffect, use } from 'react';
import api from '@/services/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface OrderDetail {
  id: string;
  user_id: number;
  product_id: number;
  product_title: string;
  buyer_username: string;
  unit_price: number;
  created_at: string;
  // Optional nested product in case your backend sends both
  product?: {
    title: string;
    description?: string;
    location?: string;
  };
}

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${id}`);
        setOrder(res.data);
      } catch (err: any) {
        console.error('Failed to load order receipt', err);
        setError('Unable to fetch order receipt details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-fixed flex flex-col" style={{ backgroundImage: "url('/products-wallpaper.jpg')" }}>
      <div className="min-h-screen bg-slate-950/80 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-yellow-400 font-orbitron text-sm animate-pulse tracking-widest">
          GENERATING DIGITAL RECEIPT...
        </div>
      </div>
    </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-fixed flex flex-col text-slate-100" style={{ backgroundImage: "url('/products-wallpaper.jpg')" }}>
      <div className="min-h-screen bg-slate-950/80 flex flex-col">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-16 flex-1 w-full text-center">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-8">
            <p className="text-rose-400 font-medium mb-6">{error || 'Order record not found.'}</p>
            <Link
              href="/products"
              className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-orbitron text-xs py-3 px-6 rounded-xl transition uppercase tracking-wider"
            >
              Return to Catalog
            </Link>
          </div>
        </main>
      </div>
      </div>
    );
  }

  // Fallbacks handle both flat keys (product_title) and nested objects (product.title)
  const itemTitle = order.product_title || order.product?.title || 'Digital Key';
  const price = typeof order.unit_price === 'number' ? order.unit_price : 0;

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed text-slate-100 flex flex-col" style={{ backgroundImage: "url('/products-wallpaper.jpg')" }}>
      <div className="min-h-screen bg-slate-950/80 flex flex-col">
        <Navbar />

      <main className="max-w-xl mx-auto px-4 py-16 flex-1 w-full">
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Top Success Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/10 border border-emerald-500/40 rounded-full text-emerald-400 text-xl font-bold mb-3 shadow-lg shadow-emerald-950/40">
              ✓
            </div>
            <h1 className="text-2xl font-black font-orbitron text-white tracking-wide">
              TRANSACTION CONFIRMED
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-orbitron">
              ORDER ID: {order.id}
            </p>
          </div>

          {/* Details Box */}
          <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800/80 space-y-4 mb-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Item</span>
              <span className="text-sm font-bold text-white font-orbitron">{itemTitle}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Player</span>
              <span className="text-xs font-orbitron text-yellow-400 bg-yellow-950/50 px-2.5 py-1 rounded border border-yellow-500/30">
                {order.buyer_username || 'Standard License'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Paid</span>
              <span className="text-xl font-black font-orbitron text-emerald-400">
                ${price.toFixed(2)}
              </span>
            </div>
          </div>

          <Link
            href="/products"
            className="block text-center w-full bg-slate-800 hover:bg-slate-700 text-white font-orbitron text-xs font-bold py-3.5 rounded-xl transition uppercase tracking-wider shadow-md"
          >
            Return to Store
          </Link>
        </div>
      </main>
      </div>
    </div>
  );
}