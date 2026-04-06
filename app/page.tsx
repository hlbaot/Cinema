import { Suspense } from 'react';
import App from '@/App';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white font-black">
      <span className="text-red-500 text-3xl">CINE</span>
      <span className="text-yellow-500 text-3xl">PRO</span>
      <span className="ml-4 text-gray-400">Đang tải...</span>
    </div>}>
      <App />
    </Suspense>
  );
}
