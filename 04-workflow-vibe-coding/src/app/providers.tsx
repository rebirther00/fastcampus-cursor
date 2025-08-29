'use client';

// 애플리케이션 Provider 설정

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { useState } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // QueryClient를 컴포넌트 내부에서 생성하여 SSR 이슈 방지
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // 5분간 데이터를 fresh로 유지
          staleTime: 1000 * 60 * 5,
          // 네트워크 에러 시 1번 재시도
          retry: 1,
          // 재시도 지연 시간 (1초 → 2초 → 4초...)
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          // 윈도우 포커스 시 자동 refetch 비활성화 (선택적)
          refetchOnWindowFocus: false,
        },
        mutations: {
          // 뮤테이션 에러 시 재시도 안함
          retry: 0,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 React Query DevTools 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
        />
      )}
      {/* FSTC-16: 토스트 알림 전역 프로바이더 */}
      <ToastProvider />
    </QueryClientProvider>
  );
}
