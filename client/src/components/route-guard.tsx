"use client";

import React from 'react';
import { useAuth } from '../context/auth-context';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'Sales' | 'Sanction' | 'Disbursement' | 'Collection' | 'Borrower')[];
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Premium loading screen to prevent raw text flashes during session boots
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute w-16 h-16 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-200">CreditSea Security</h3>
            <p className="text-slate-400 text-xs mt-1 animate-pulse">Establishing encrypted session...</p>
          </div>
        </div>
      </div>
    );
  }

  // If session is unauthenticated, let the AuthContext hook run redirect in the background
  if (!user) {
    return null;
  }

  // If role is restricted, let the AuthContext hook execute fallback redirect
  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'Admin') {
    return null;
  }

  return <>{children}</>;
};
export default RouteGuard;
