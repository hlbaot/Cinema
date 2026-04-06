'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Chuyển hướng về trang chủ kèm theo các tham số nhận được
    const params = searchParams.toString();
    const targetUrl = params ? `/?${params}` : '/';
    
    // Sử dụng router.replace để không lưu lại trang callback này trong lịch sử duyệt web
    router.replace(targetUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-bold italic">Đang xác thực thông tin...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CallbackHandler />
    </Suspense>
  );
}
