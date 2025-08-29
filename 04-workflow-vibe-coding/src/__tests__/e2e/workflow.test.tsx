/**
 * E2E 워크플로우 테스트
 * FSTC-13: 전체 사용자 시나리오 기반 통합 테스트
 * 
 * 테스트 시나리오:
 * 1. 개발자 워크플로우 (카드 생성 → 개발 → QA)
 * 2. PO 워크플로우 (배포 승인 → 배포 완료)
 * 3. 복합 시나리오 (의존성, 리뷰어, WIP 제한)
 * 4. 에러 시나리오 (권한 부족, 규칙 위반)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BoardTemplate } from '@/components/templates/BoardTemplate';
import { mockWorkflowBoard, mockUsers } from '@/lib/mock-data';
import { WorkflowBoard } from '@/types/workflow';

// sonner는 jest.setup.js에서 모킹됨
const toast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
};

// Mock 전역 상태
const mockCurrentUserRole = jest.fn();
const mockSetCurrentUserRole = jest.fn();

jest.mock('@/store/uiStore', () => ({
  useCurrentUserRole: () => ({
    role: mockCurrentUserRole(),
    setRole: mockSetCurrentUserRole
  }),
  useCardDetailModal: () => ({
    isOpen: false,
    selectedCardId: null,
    open: jest.fn(),
    close: jest.fn()
  })
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWorkflowApp = (board: WorkflowBoard = mockWorkflowBoard) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BoardTemplate board={board} />
    </QueryClientProvider>
  );
};

describe('E2E 워크플로우 테스트', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUserRole.mockReturnValue('developer');
  });

  describe('🔧 개발자 워크플로우', () => {
    it('시나리오 1: 새 카드 생성 → 개발 진행 → QA 요청', async () => {
      renderWorkflowApp();
      
      // Step 1: 새 카드 생성
      const addCardButton = screen.getByRole('button', { name: '새 티켓 추가' });
      await user.click(addCardButton);
      
      // 모달에서 카드 정보 입력
      await user.type(screen.getByLabelText('제목'), '새로운 API 엔드포인트 개발');
      await user.type(screen.getByLabelText('설명'), 'REST API 엔드포인트를 개발합니다');
      
      // 담당자 및 리뷰어 설정
      const assigneeSelect = screen.getByLabelText('담당자');
      await user.click(assigneeSelect);
      await user.click(screen.getByText('김개발'));
      
      // 리뷰어 2명 추가 (규칙 준수)
      const addReviewerButton = screen.getByRole('button', { name: '리뷰어 추가' });
      await user.click(addReviewerButton);
      
      const reviewerSelect1 = screen.getByLabelText('리뷰어 선택');
      await user.click(reviewerSelect1);
      await user.click(screen.getByText('박프론트'));
      
      await user.click(addReviewerButton);
      const reviewerSelect2 = screen.getAllByLabelText('리뷰어 선택')[1];
      await user.click(reviewerSelect2);
      await user.click(screen.getByText('이백엔드'));
      
      // 우선순위 설정
      const prioritySelect = screen.getByLabelText('우선순위');
      await user.click(prioritySelect);
      await user.click(screen.getByText('높음'));
      
      // 카드 저장
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);
      
      // Step 2: 백로그에서 개발 중으로 이동
      await waitFor(() => {
        expect(screen.getByText('새로운 API 엔드포인트 개발')).toBeInTheDocument();
      });
      
      const newCard = screen.getByTestId('card-new-card-id');
      const inProgressColumn = screen.getByTestId('column-in_progress');
      
      fireEvent.dragStart(newCard);
      fireEvent.drop(inProgressColumn);
      fireEvent.dragEnd(newCard);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
      
      // Step 3: 개발 중에서 QA 요청으로 이동 (리뷰어 조건 충족)
      const qaColumn = screen.getByTestId('column-ready_for_qa');
      
      fireEvent.dragStart(newCard);
      fireEvent.drop(qaColumn);
      fireEvent.dragEnd(newCard);
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
      
      // QA 요청 컬럼에 카드가 있는지 확인
      expect(within(qaColumn).getByText('새로운 API 엔드포인트 개발')).toBeInTheDocument();
    });
    
    it('시나리오 2: 리뷰어 부족으로 QA 요청 실패', async () => {
      renderWorkflowApp();
      
      // 리뷰어가 1명만 있는 카드를 QA 요청으로 이동 시도
      const cardWithOneReviewer = screen.getByTestId('card-card-1');
      const qaColumn = screen.getByTestId('column-ready_for_qa');
      
      fireEvent.dragStart(cardWithOneReviewer);
      fireEvent.drop(qaColumn);
      fireEvent.dragEnd(cardWithOneReviewer);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('리뷰어가 부족합니다')
        );
      });
      
      // 카드가 원래 위치(개발 중)에 그대로 있는지 확인
      const inProgressColumn = screen.getByTestId('column-in_progress');
      expect(within(inProgressColumn).getByTestId('card-card-1')).toBeInTheDocument();
    });

    it('시나리오 3: 의존성 미완료로 QA 요청 실패', async () => {
      // 의존성이 미완료 상태인 보드 설정
      const boardWithPendingDependency = {
        ...mockWorkflowBoard,
        columns: mockWorkflowBoard.columns.map(column => ({
          ...column,
          cards: column.cards.map(card => 
            card.id === 'card-2' 
              ? {
                  ...card,
                  dependencies: [{
                    id: 'dep-pending',
                    title: '미완료 의존성',
                    status: 'in_progress' as const,
                    required: true
                  }],
                  reviewers: mockUsers.slice(0, 2) // 리뷰어 조건은 충족
                }
              : card
          )
        }))
      };
      
      renderWorkflowApp(boardWithPendingDependency);
      
      const cardWithPendingDep = screen.getByTestId('card-card-2');
      const qaColumn = screen.getByTestId('column-ready_for_qa');
      
      fireEvent.dragStart(cardWithPendingDep);
      fireEvent.drop(qaColumn);
      fireEvent.dragEnd(cardWithPendingDep);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('의존성이 완료되지 않았습니다')
        );
      });
    });
  });

  describe('👔 PO 워크플로우', () => {
    beforeEach(() => {
      mockCurrentUserRole.mockReturnValue('product_owner');
    });

    it('시나리오 4: PO가 배포 승인 → 배포 완료 이동 성공', async () => {
      renderWorkflowApp();
      
      const deployCard = screen.getByTestId('card-card-5'); // 배포 승인 상태
      const doneColumn = screen.getByTestId('column-done');
      
      fireEvent.dragStart(deployCard);
      fireEvent.drop(doneColumn);
      fireEvent.dragEnd(deployCard);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
      
      // 배포 완료 컬럼에 카드가 있는지 확인
      expect(within(doneColumn).getByText('결제 시스템 통합')).toBeInTheDocument();
    });

    it('시나리오 5: PO가 모든 단계 건너뛰기 허용 (설정에 따라)', async () => {
      const boardWithSkipAllowed = {
        ...mockWorkflowBoard,
        settings: {
          ...mockWorkflowBoard.settings,
          allowSkipStages: true
        }
      };
      
      renderWorkflowApp(boardWithSkipAllowed);
      
      // 백로그에서 바로 배포 완료로 이동 (PO 권한)
      const backlogCard = screen.getByTestId('card-card-4');
      const doneColumn = screen.getByTestId('column-done');
      
      fireEvent.dragStart(backlogCard);
      fireEvent.drop(doneColumn);
      fireEvent.dragEnd(backlogCard);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
    });
  });

  describe('🚫 권한 제한 시나리오', () => {
    it('시나리오 6: 개발자가 배포 승인 → 배포 완료 이동 시도 실패', async () => {
      mockCurrentUserRole.mockReturnValue('developer');
      
      renderWorkflowApp();
      
      const deployCard = screen.getByTestId('card-card-5');
      const doneColumn = screen.getByTestId('column-done');
      
      fireEvent.dragStart(deployCard);
      fireEvent.drop(doneColumn);
      fireEvent.dragEnd(deployCard);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('권한이 없습니다')
        );
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('프로덕트 오너만')
        );
      });
      
      // 카드가 원래 위치에 그대로 있는지 확인
      const deployColumn = screen.getByTestId('column-ready_for_deploy');
      expect(within(deployColumn).getByTestId('card-card-5')).toBeInTheDocument();
    });

    it('시나리오 7: 단계 건너뛰기 금지 설정에서 건너뛰기 시도 실패', async () => {
      renderWorkflowApp(); // 기본 설정: allowSkipStages = false
      
      const backlogCard = screen.getByTestId('card-card-4');
      const qaColumn = screen.getByTestId('column-ready_for_qa');
      
      fireEvent.dragStart(backlogCard);
      fireEvent.drop(qaColumn);
      fireEvent.dragEnd(backlogCard);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('단계를 건너뛸 수 없습니다')
        );
      });
    });
  });

  describe('📊 WIP 제한 시나리오', () => {
    it('시나리오 8: WIP 제한 초과 시 이동 거부', async () => {
      // WIP 제한이 있는 컬럼을 가득 채운 보드
      const boardWithFullWip = {
        ...mockWorkflowBoard,
        columns: mockWorkflowBoard.columns.map(column => 
          column.status === 'in_progress' 
            ? {
                ...column,
                maxCards: 2, // 최대 2개
                cards: [
                  ...column.cards,
                  { ...column.cards[0], id: 'extra-card-1' },
                  { ...column.cards[0], id: 'extra-card-2' }
                ] // 이미 2개로 가득 참
              }
            : column
        )
      };
      
      renderWorkflowApp(boardWithFullWip);
      
      const backlogCard = screen.getByTestId('card-card-4');
      const fullInProgressColumn = screen.getByTestId('column-in_progress');
      
      fireEvent.dragStart(backlogCard);
      fireEvent.drop(fullInProgressColumn);
      fireEvent.dragEnd(backlogCard);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('WIP 제한을 초과합니다')
        );
      });
    });

    it('시나리오 9: WIP 제한 비활성화 시 제한 없이 이동', async () => {
      const boardWithoutWipLimits = {
        ...mockWorkflowBoard,
        settings: {
          ...mockWorkflowBoard.settings,
          enforceWipLimits: false
        }
      };
      
      renderWorkflowApp(boardWithoutWipLimits);
      
      const backlogCard = screen.getByTestId('card-card-4');
      const inProgressColumn = screen.getByTestId('column-in_progress');
      
      fireEvent.dragStart(backlogCard);
      fireEvent.drop(inProgressColumn);
      fireEvent.dragEnd(backlogCard);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
    });
  });

  describe('🔄 역방향 이동 시나리오', () => {
    it('시나리오 10: QA 완료 → QA 요청 역방향 이동 허용', async () => {
      renderWorkflowApp();
      
      const qaDoneCard = screen.getByTestId('card-card-3'); // QA 완료 상태
      const qaRequestColumn = screen.getByTestId('column-ready_for_qa');
      
      fireEvent.dragStart(qaDoneCard);
      fireEvent.drop(qaRequestColumn);
      fireEvent.dragEnd(qaDoneCard);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
    });

    it('시나리오 11: 배포 완료에서 다른 상태로 역이동 금지', async () => {
      // 배포 완료 상태의 카드를 포함한 보드
      const boardWithDoneCard = {
        ...mockWorkflowBoard,
        columns: mockWorkflowBoard.columns.map(column => 
          column.status === 'done'
            ? {
                ...column,
                cards: [{
                  ...mockWorkflowBoard.columns[0].cards[0],
                  id: 'done-card',
                  status: 'done' as const
                }]
              }
            : column
        )
      };
      
      renderWorkflowApp(boardWithDoneCard);
      
      const doneCard = screen.getByTestId('card-done-card');
      const deployColumn = screen.getByTestId('column-ready_for_deploy');
      
      fireEvent.dragStart(doneCard);
      fireEvent.drop(deployColumn);
      fireEvent.dragEnd(doneCard);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('완료된 카드는 이동할 수 없습니다')
        );
      });
    });
  });

  describe('🎭 역할 전환 시나리오', () => {
    it('시나리오 12: 런타임 역할 전환 후 권한 변경 확인', async () => {
      renderWorkflowApp();
      
      // 초기에는 개발자 역할
      expect(mockCurrentUserRole()).toBe('developer');
      
      // 배포 승인 → 배포 완료 이동 시도 (실패해야 함)
      const deployCard = screen.getByTestId('card-card-5');
      const doneColumn = screen.getByTestId('column-done');
      
      fireEvent.dragStart(deployCard);
      fireEvent.drop(doneColumn);
      fireEvent.dragEnd(deployCard);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('권한이 없습니다')
        );
      });
      
      // 역할을 PO로 변경
      mockCurrentUserRole.mockReturnValue('product_owner');
      
      // 역할 전환 UI 조작
      const roleSwitch = screen.getByTestId('user-role-switcher');
      await user.click(roleSwitch);
      await user.click(screen.getByText('프로덕트 오너'));
      
      // 같은 이동을 다시 시도 (성공해야 함)
      fireEvent.dragStart(deployCard);
      fireEvent.drop(doneColumn);
      fireEvent.dragEnd(deployCard);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
    });
  });

  describe('🔍 복합 시나리오', () => {
    it('시나리오 13: 모든 조건을 충족하는 완벽한 워크플로우', async () => {
      renderWorkflowApp();
      
      // 1. 카드 수정하여 모든 조건 충족
      const card = screen.getByTestId('card-card-1');
      await user.click(card);
      
      // 리뷰어 추가 (최소 2명 충족)
      const addReviewerButton = screen.getByRole('button', { name: '리뷰어 추가' });
      await user.click(addReviewerButton);
      
      const reviewerSelect = screen.getByLabelText('리뷰어 선택');
      await user.click(reviewerSelect);
      await user.click(screen.getByText('최PO'));
      
      // 의존성 추가 (이미 완료된 것으로)
      const addDependencyButton = screen.getByRole('button', { name: '의존성 추가' });
      await user.click(addDependencyButton);
      
      const dependencySelect = screen.getByLabelText('의존성 선택');
      await user.click(dependencySelect);
      await user.click(screen.getByText('API 인증 시스템 구축')); // 완료 상태
      
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      
      // 2. 이제 조건을 충족하므로 QA 요청으로 이동 가능
      const qaColumn = screen.getByTestId('column-ready_for_qa');
      
      fireEvent.dragStart(card);
      fireEvent.drop(qaColumn);
      fireEvent.dragEnd(card);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
      
      // 3. QA 완료로 이동
      const qaDoneColumn = screen.getByTestId('column-qa_done');
      
      fireEvent.dragStart(card);
      fireEvent.drop(qaDoneColumn);
      fireEvent.dragEnd(card);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
      
      // 4. 배포 승인으로 이동
      const deployColumn = screen.getByTestId('column-ready_for_deploy');
      
      fireEvent.dragStart(card);
      fireEvent.drop(deployColumn);
      fireEvent.dragEnd(card);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
      
      // 5. PO 역할로 전환 후 배포 완료
      mockCurrentUserRole.mockReturnValue('product_owner');
      
      const doneColumn = screen.getByTestId('column-done');
      
      fireEvent.dragStart(card);
      fireEvent.drop(doneColumn);
      fireEvent.dragEnd(card);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '카드가 성공적으로 이동되었습니다'
        );
      });
      
      // 최종 확인: 카드가 배포 완료 컬럼에 있음
      expect(within(doneColumn).getByTestId('card-card-1')).toBeInTheDocument();
    });
  });
});
