"use client";

import React from 'react';
import { RouteGuard } from '../../components/route-guard';
import { Navbar } from '../../components/navbar';

export default function BorrowerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={['Borrower']}>
      <div className="flex flex-col min-h-screen bg-slate-950">
        {/* Borrower Navigation Header */}
        <Navbar isBorrower={true} />

        {/* Dynamic content area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
