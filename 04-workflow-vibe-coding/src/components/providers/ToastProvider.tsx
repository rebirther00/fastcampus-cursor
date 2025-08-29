'use client';

// 토스트 알림 전역 프로바이더
// FSTC-16: 사용자 알림 시스템 구현

import { Toaster } from 'sonner';

/**
 * 토스트 알림 전역 프로바이더
 * 
 * Sonner 라이브러리를 사용하여 전역 토스트 알림 시스템을 제공합니다.
 * 앱의 최상위 레벨에서 사용하여 모든 컴포넌트에서 토스트 알림을 표시할 수 있습니다.
 * 
 * 사용법:
 * - layout.tsx에서 이 컴포넌트를 추가
 * - 각 컴포넌트에서 toast.success(), toast.error() 등을 사용
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand
      visibleToasts={5}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        className: 'toast',
        descriptionClassName: 'toast-description',
        actionButtonStyle: {
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
        },
        cancelButtonStyle: {
          background: 'hsl(var(--muted))',
          color: 'hsl(var(--muted-foreground))',
        },
      }}
    />
  );
}

