"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoanApplyRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/borrower');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Redirecting to Borrower Hub...</p>
      </div>
    </div>
  );
}
