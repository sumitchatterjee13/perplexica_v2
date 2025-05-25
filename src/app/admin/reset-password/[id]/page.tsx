'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ActualParamsType { id: string; }
interface ActualSearchParamsType { [key: string]: string | string[] | undefined; }

interface ResetPasswordPageProps {
  params: Promise<ActualParamsType>;
  searchParams?: Promise<ActualSearchParamsType | undefined>;
}

export default function ResetPasswordPage({ 
  params: paramsPromise, 
  searchParams: searchParamsPromise 
}: ResetPasswordPageProps) {
  const [resolvedParams, setResolvedParams] = useState<ActualParamsType | null>(null);
  const [resolvedSearchParams, setResolvedSearchParams] = useState<ActualSearchParamsType | null | undefined>(null);
  const [propsLoading, setPropsLoading] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const resolveProps = async () => {
      setPropsLoading(true);
      try {
        const p = await paramsPromise;
        const sp = searchParamsPromise ? await searchParamsPromise : undefined;
        if (active) {
          setResolvedParams(p);
          setResolvedSearchParams(sp);
        }
      } catch (err) {
        console.error('Error resolving page props:', err);
        if (active) setError('Failed to load page data. Please try again.');
      } finally {
        if (active) setPropsLoading(false);
      }
    };
    resolveProps();
    return () => { active = false; };
  }, [paramsPromise, searchParamsPromise]);

  const userId = resolvedParams?.id;

  useEffect(() => {
    if (!userId) { 
      if (!propsLoading) setLoading(false); 
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/users/${userId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, propsLoading]); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError('User ID is missing. Cannot reset password.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reset password');
      }
      
      setSuccess(true);
      
      // Reset form
      setPassword('');
      setConfirmPassword('');
      
      // Redirect back to admin after 2 seconds
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while resetting the password');
    } finally {
      setSaving(false);
    }
  };

  if (propsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
        <p className="ml-2">Loading page data...</p>
      </div>
    );
  }

  if (loading && !error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <Link 
        href="/admin" 
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to User Management
      </Link>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Reset Password for {user?.name || (userId ? `user ${userId.substring(0,8)}...` : 'User')}
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Password has been reset successfully! Redirecting...
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || success}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
            >
              {saving ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
