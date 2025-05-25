'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!res.ok || !data.authenticated) {
          // Not authenticated, redirect to login
          router.push('/login');
          return;
        }

        // Check for required role if specified
        if (requiredRole && data.user.role !== requiredRole && data.user.role !== 'admin') {
          // User doesn't have the required role
          router.push('/');
          return;
        }

        // User is authenticated and has required role
        setLoading(false);
      } catch (error) {
        console.error('Failed to check authentication', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
