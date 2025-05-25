'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, LogOut, Home } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (res.ok && data.authenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };



  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-[#121212]">
        {/* Sidebar */}
        <div className="w-64 bg-[#1a1b26] shadow-lg border-r border-gray-800">
          <div className="flex flex-col h-full">
          <div className="px-4 py-6 border-b border-gray-700">
            <h1 className="text-xl font-semibold text-white">
              Perplexica Admin
            </h1>
            <p className="text-sm text-gray-300 mt-1">
              Logged in as <span className="font-medium text-indigo-300">{user?.name}</span>
            </p>
          </div>
          <nav className="px-4 py-4 flex flex-col space-y-2">
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-800 text-gray-300 transition-colors"
            >
              <Home size={18} />
              <span>Back to App</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-800 text-white font-medium"
            >
              <Users size={18} />
              <span>User Management</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-800 text-gray-300 w-full text-left mt-auto transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
