'use client';

import { useDefaultBoardData } from '@/hooks/useBoardData';
import { BoardTemplate } from '@/components/templates/BoardTemplate';
import { useCurrentUserRole } from '@/store/uiStore';
import { Loader2 } from 'lucide-react';

/**
 * 워크플로우 보드 페이지
 * 
 * FSTC-12: 기본 UI 컴포넌트 구현 및 데이터 연동
 * - useBoardData 훅으로 보드 데이터 페칭
 * - 로딩/에러 상태 처리
 * - BoardTemplate으로 전체 보드 렌더링
 */
export default function BoardPage() {
  const { board, isLoading, error, refetch } = useDefaultBoardData();
  const { role: currentUserRole } = useCurrentUserRole();

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">보드 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="text-destructive text-lg font-semibold">
            데이터를 불러올 수 없습니다
          </div>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 보드 데이터가 없는 경우
  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">보드 데이터를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  // 정상 렌더링
  return <BoardTemplate board={board} currentUserRole={currentUserRole} />;
}
