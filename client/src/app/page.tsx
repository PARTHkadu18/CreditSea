"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
    } else {
      if (user.role === 'Borrower') {
        router.replace('/borrower');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="absolute w-12 h-12 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 text-sm animate-pulse">Initializing Portal Control...</p>
      </div>
    </div>
  );
}
