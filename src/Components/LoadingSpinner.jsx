import React from 'react';

export const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
    <p className="text-sm text-gray-600">Loading...</p>
  </div>
);
