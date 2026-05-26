"use client";

import React from 'react';
import { RouteGuard } from '../../components/route-guard';
import { Sidebar } from '../../components/sidebar';
import { Navbar } from '../../components/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={['Sales', 'Sanction', 'Disbursement', 'Collection', 'Admin']}>
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        {/* Left Hand Sidebar Navigation */}
        <Sidebar />

        {/* Right Hand Content Grid */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Dashboard Control Top Bar */}
          <Navbar isBorrower={false} />

          {/* Dynamic Module Content Viewport */}
          <main className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
