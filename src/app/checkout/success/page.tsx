'use client';

import { Suspense } from 'react';
import SuccessContent from './success-content';

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
