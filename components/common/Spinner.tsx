import React from 'react';

interface SpinnerProps {
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-amber-200/30 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
      </div>
      {message && (
        <p className="mt-4 text-amber-200 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default Spinner;
