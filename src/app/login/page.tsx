'use client';

import { Suspense } from 'react';
import LoginClientContent from './LoginClientContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginClientContent />
    </Suspense>
  );
}

// Basic fallback component to match the overall page structure during loading
function LoginPageFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Perplexica
          </h1>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Loading...
          </h2>
        </div>
      </div>
    </div>
  );
}
