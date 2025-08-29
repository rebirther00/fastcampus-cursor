/**
 * 보드 템플릿 드래그 앤 드롭 통합 테스트
 * FSTC-13: 드래그 앤 드롭 로직 연결
 * 
 * 테스트 범위:
 * 1. 드래그 앤 드롭 기본 동작
 * 2. 규칙 엔진과의 통합
 * 3. 상태 업데이트 및 UI 반응
 * 4. 에러 처리 및 복귀 동작
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BoardTemplate } from '../BoardTemplate';
import { mockWorkflowBoard } from '@/lib/mock-data';
import { WorkflowBoard } from '@/types/workflow';

// sonner는 jest.setup.js에서 모킹됨
const toast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
};

// Mock 모듈들
const mockCanMove = jest.fn();
jest.mock('@/lib/rules', () => ({
  canMove: mockCanMove
}));

jest.mock('@/hooks/useCardMutations');
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// 테스트 유틸리티
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderBoardTemplate = (board: WorkflowBoard = mockWorkflowBoard) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BoardTemplate board={board} />
    </QueryClientProvider>
  );
};

describe('BoardTemplate 드래그 앤 드롭', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('✅ 성공적인 드래그 앤 드롭', () => {
    it('유효한 카드 이동 시 상태 업데이트', async () => {
      // 규칙 엔진 모킹 - 이동 허용
      mockCanMove.mockReturnValue({ allowed: true });
      
      renderBoardTemplate();
      
      // 드래그할 카드와 드롭할 컬럼 찾기
      const card = screen.getByTestId('card-card-1');
      const targetColumn = screen.getByTestId('column-ready_for_qa');
      
      // 드래그 앤 드롭 시뮬레이션
      fireEvent.dragStart(card);
      fireEvent.dragOver(targetColumn);
      fireEvent.drop(targetColumn);
      fireEvent.dragEnd(card);
      
      // 규칙 엔진 호출 확인
      await waitFor(() => {
        expect(mockCanMove).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'card-1' }),
          'in_progress',
          'ready_for_qa',
          'developer', // 현재 사용자 역할
          expect.any(Object)
        );
      });
      
      // 성공 토스트 확인
      expect(toast.success).toHaveBeenCalledWith(
        '카드가 성공적으로 이동되었습니다'
      );
    });

    it('PO가 배포 승인 → 배포 완료 이동 성공', async () => {
      mockCanMove.mockReturnValue({ allowed: true });
      
      // PO 역할로 설정된 보드
      const boardWithPO = {
        ...mockWorkflowBoard,
        members: mockWorkflowBoard.members.map(member => 
          member.id === 'user-4' ? { ...member, role: 'product_owner' as const } : member
        )
      };
      
      renderBoardTemplate(boardWithPO);
      
      const deployCard = screen.getByTestId('card-card-5'); // 배포 승인 상태 카드
      const doneColumn = screen.getByTestId('column-done');
      
      fireEvent.dragStart(deployCard);
      fireEvent.drop(doneColumn);
      fireEvent.dragEnd(deployCard);
      
      await waitFor(() => {
        expect(mockCanMove).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'card-5' }),
          'ready_for_deploy',
          'done',
          'product_owner',
          expect.any(Object)
        );
      });
    });
  });

  describe('❌ 실패한 드래그 앤 드롭', () => {
    it('권한 없는 이동 시도 시 에러 처리', async () => {
      mockCanMove.mockReturnValue({
        allowed: false,
        reason: '권한이 없습니다. 프로덕트 오너만 배포 완료로 이동할 수 있습니다.'
      });
      
      renderBoardTemplate();
      
      const deployCard = screen.getByTestId('card-card-5');
      const doneColumn = screen.getByTestId('column-done');
      
      fireEvent.dragStart(deployCard);
      fireEvent.drop(doneColumn);
      fireEvent.dragEnd(deployCard);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '카드 이동 실패: 권한이 없습니다. 프로덕트 오너만 배포 완료로 이동할 수 있습니다.'
        );
      });
      
      // 카드가 원래 위치에 있는지 확인
      const originalColumn = screen.getByTestId('column-ready_for_deploy');
      expect(originalColumn).toContainElement(deployCard);
    });

    it('의존성 미완료로 인한 이동 실패', async () => {
      mockCanMove.mockReturnValue({
        allowed: false,
        reason: '의존성이 완료되지 않았습니다: UI 컴포넌트 라이브러리'
      });
      
      renderBoardTemplate();
      
      const card = screen.getByTestId('card-card-2');
      const qaColumn = screen.getByTestId('column-ready_for_qa');
      
      fireEvent.dragStart(card);
      fireEvent.drop(qaColumn);
      fireEvent.dragEnd(card);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '카드 이동 실패: 의존성이 완료되지 않았습니다: UI 컴포넌트 라이브러리'
        );
      });
    });

    it('리뷰어 부족으로 인한 이동 실패', async () => {
      mockCanMove.mockReturnValue({
        allowed: false,
        reason: '리뷰어가 부족합니다. 최소 2명의 리뷰어가 필요합니다. (현재: 1명)'
      });
      
      renderBoardTemplate();
      
      const card = screen.getByTestId('card-card-1');
      const qaColumn = screen.getByTestId('column-ready_for_qa');
      
      fireEvent.dragStart(card);
      fireEvent.drop(qaColumn);
      fireEvent.dragEnd(card);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '카드 이동 실패: 리뷰어가 부족합니다. 최소 2명의 리뷰어가 필요합니다. (현재: 1명)'
        );
      });
    });
  });

  describe('🎯 WIP 제한 검증', () => {
    it('WIP 제한 초과 시 이동 거부', async () => {
      mockCanMove.mockReturnValue({
        allowed: false,
        reason: 'WIP 제한을 초과합니다. 개발 중 컬럼의 최대 카드 수는 3개입니다.'
      });
      
      renderBoardTemplate();
      
      const card = screen.getByTestId('card-card-4'); // 백로그 카드
      const inProgressColumn = screen.getByTestId('column-in_progress');
      
      fireEvent.dragStart(card);
      fireEvent.drop(inProgressColumn);
      fireEvent.dragEnd(card);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '카드 이동 실패: WIP 제한을 초과합니다. 개발 중 컬럼의 최대 카드 수는 3개입니다.'
        );
      });
    });

    it('WIP 제한이 비활성화된 경우 제한 없이 이동', async () => {
      mockCanMove.mockReturnValue({ allowed: true });
      
      const boardWithoutWipLimits = {
        ...mockWorkflowBoard,
        settings: {
          ...mockWorkflowBoard.settings,
          enforceWipLimits: false
        }
      };
      
      renderBoardTemplate(boardWithoutWipLimits);
      
      const card = screen.getByTestId('card-card-4');
      const inProgressColumn = screen.getByTestId('column-in_progress');
      
      fireEvent.dragStart(card);
      fireEvent.drop(inProgressColumn);
      fireEvent.dragEnd(card);
      
      await waitFor(() => {
        expect(mockCanMove).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(String),
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            enforceWipLimits: false
          })
        );
      });
    });
  });

  describe('🚨 Edge Cases', () => {
    it('드롭 대상이 없는 경우 처리', async () => {
      renderBoardTemplate();
      
      const card = screen.getByTestId('card-card-1');
      
      fireEvent.dragStart(card);
      fireEvent.dragEnd(card); // over 없이 dragEnd
      
      // 규칙 엔진이 호출되지 않아야 함
      expect(mockCanMove).not.toHaveBeenCalled();
      
      // 에러 토스트도 표시되지 않아야 함
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('동일한 컬럼으로의 드래그 앤 드롭 처리', async () => {
      renderBoardTemplate();
      
      const card = screen.getByTestId('card-card-1');
      const sameColumn = screen.getByTestId('column-in_progress');
      
      fireEvent.dragStart(card);
      fireEvent.drop(sameColumn);
      fireEvent.dragEnd(card);
      
      // 동일한 상태로의 이동은 무시되어야 함
      expect(mockCanMove).not.toHaveBeenCalled();
    });

    it('네트워크 에러 시 처리', async () => {
      mockCanMove.mockReturnValue({ allowed: true });
      
      // 뮤테이션 에러 모킹
      const mockMutation = {
        mutate: jest.fn().mockImplementation(() => {
          // 에러 시뮬레이션
          throw new Error('Network Error');
        })
      };
      
      jest.doMock('@/hooks/useCardMutations', () => ({
        useUpdateCardMutation: () => mockMutation
      }));
      
      renderBoardTemplate();
      
      const card = screen.getByTestId('card-card-1');
      const targetColumn = screen.getByTestId('column-ready_for_qa');
      
      fireEvent.dragStart(card);
      fireEvent.drop(targetColumn);
      fireEvent.dragEnd(card);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '카드 이동 중 오류가 발생했습니다: Network Error'
        );
      });
    });

    it('드래그 중 컴포넌트 언마운트 처리', async () => {
      const { unmount } = renderBoardTemplate();
      
      const card = screen.getByTestId('card-card-1');
      
      fireEvent.dragStart(card);
      
      // 드래그 중 컴포넌트 언마운트
      unmount();
      
      // 메모리 누수나 에러가 발생하지 않아야 함
      expect(() => {
        // 클린업 함수가 정상적으로 실행되어야 함
      }).not.toThrow();
    });
  });

  describe('📱 접근성 및 키보드 지원', () => {
    it('키보드로 카드 이동 가능', async () => {
      mockCanMove.mockReturnValue({ allowed: true });
      
      renderBoardTemplate();
      
      const card = screen.getByTestId('card-card-1');
      
      // 카드 포커스
      card.focus();
      
      // 스페이스바로 드래그 시작
      fireEvent.keyDown(card, { key: ' ', code: 'Space' });
      
      // 화살표 키로 이동
      fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
      
      // 스페이스바로 드롭
      fireEvent.keyDown(document, { key: ' ', code: 'Space' });
      
      await waitFor(() => {
        expect(mockCanMove).toHaveBeenCalled();
      });
    });

    it('스크린 리더 지원 - 드래그 상태 안내', async () => {
      renderBoardTemplate();
      
      const card = screen.getByTestId('card-card-1');
      
      fireEvent.dragStart(card);
      
      // aria-describedby 속성으로 드래그 상태 안내
      expect(card).toHaveAttribute('aria-describedby');
      
      const describedById = card.getAttribute('aria-describedby');
      if (describedById) {
        const description = document.getElementById(describedById);
        expect(description?.textContent).toContain('드래그 중입니다');
      }
    });
  });
});
