'use client';

import { WorkflowBoard } from '@/types/workflow';
import { Button } from '@/components/atoms/button';
import { UserRoleSwitcher } from '@/components/molecules/UserRoleSwitcher';
import { RuleSettingsModal } from '@/components/organisms/RuleSettingsModal';
import { useCurrentUserRole } from '@/store/uiStore';
import { useRuleModal } from '@/store/ruleStore';
import { Plus, Settings } from 'lucide-react';

interface HeaderProps {
  board: WorkflowBoard;
  onCreateCard?: () => void;
}

/**
 * 워크플로우 보드 헤더
 * 
 * FSTC-12: 기본 UI 컴포넌트 구현 및 데이터 연동
 * - 프로젝트 제목 표시
 * - 새 티켓 추가 버튼
 * - 사용자 역할 전환기
 * - 보드 설정 버튼 (향후 확장용)
 */
export function Header({ board, onCreateCard }: HeaderProps) {
  const { role } = useCurrentUserRole();
  const { open: openRuleModal } = useRuleModal();
  
  const handleAddTicket = () => {
    if (onCreateCard) {
      onCreateCard();
    } else {
      console.log('새 티켓 추가 핸들러가 없습니다');
    }
  };

  const handleSettings = () => {
    // FSTC-16: 규칙 설정 모달 열기
    openRuleModal();
    console.log('🔧 규칙 설정 모달 열림');
  };

  // PO 역할인지 확인
  const isProductOwner = role === 'product_owner';

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-6 py-4">
        {/* 왼쪽: 보드 정보 */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {board.title}
            </h1>
            {board.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {board.description}
              </p>
            )}
          </div>
        </div>

        {/* 오른쪽: 액션 버튼들 */}
        <div className="flex items-center gap-3">
          {/* 사용자 역할 전환기 */}
          <UserRoleSwitcher />
          
          {/* 새 티켓 추가 버튼 */}
          <Button 
            onClick={handleAddTicket}
            className="gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            새 티켓 추가
          </Button>
          
          {/* 설정 버튼 - PO 역할일 때만 표시 */}
          {isProductOwner && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleSettings}
              className="h-9 w-9"
              title="워크플로우 규칙 설정 (PO 전용)"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">워크플로우 규칙 설정</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* 보드 통계 정보 */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>
            총 {board.columns.reduce((acc, col) => acc + col.cards.length, 0)}개 티켓
          </span>
          <span>
            팀원 {board.members.length}명
          </span>
          <span>
            마지막 업데이트: {new Date(board.updatedAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>
      
      {/* FSTC-16: 규칙 설정 모달 */}
      <RuleSettingsModal />
    </header>
  );
}
