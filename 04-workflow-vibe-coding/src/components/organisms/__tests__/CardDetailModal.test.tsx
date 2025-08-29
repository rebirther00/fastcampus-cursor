/**
 * 카드 상세 모달 테스트
 * FSTC-13: 카드 생성/수정 모달 및 폼 기능
 * 
 * 테스트 범위:
 * 1. 모달 열기/닫기 동작
 * 2. 카드 생성 폼 기능
 * 3. 카드 수정 폼 기능  
 * 4. 폼 유효성 검사
 * 5. 리뷰어 및 의존성 설정
 */

import { describe, it, beforeEach, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock 컴포넌트 props 타입 정의
interface MockCardDetailModalProps {
  card?: unknown;
  availableUsers?: unknown;
  availableDependencies?: unknown;
  [key: string]: unknown;
}

// CardDetailModal은 아직 구현되지 않았으므로 임시 mock
const CardDetailModal = (props: MockCardDetailModalProps) => (
  <div data-testid="card-detail-modal" data-props={JSON.stringify(props)}>Mock CardDetailModal</div>
);

import { mockUsers, mockCards, mockDependencies } from '@/lib/mock-data';

// Mock 모듈들
jest.mock('@/hooks/useCardMutations');
jest.mock('@/store/uiStore');
jest.mock('sonner');

const mockCreateCard = jest.fn();
const mockUpdateCard = jest.fn();
const mockCloseModal = jest.fn();

// Mock 훅 리턴값
jest.doMock('@/hooks/useCardMutations', () => ({
  useCreateCardMutation: () => ({
    mutate: mockCreateCard,
    isPending: false
  }),
  useUpdateCardMutation: () => ({
    mutate: mockUpdateCard,
    isPending: false
  })
}));

jest.doMock('@/store/uiStore', () => ({
  useCardDetailModal: () => ({
    isOpen: true,
    selectedCardId: 'card-1',
    close: mockCloseModal
  })
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderCardDetailModal = (props = {}) => {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <CardDetailModal 
        card={mockCards[0]}
        availableUsers={mockUsers}
        availableDependencies={mockDependencies}
        {...props}
      />
    </QueryClientProvider>
  );
};

describe('CardDetailModal', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('✅ 모달 기본 동작', () => {
    it('모달이 정상적으로 렌더링됨', () => {
      renderCardDetailModal();
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('카드 상세')).toBeInTheDocument();
      expect(screen.getByDisplayValue('사용자 로그인 기능 구현')).toBeInTheDocument();
    });

    it('닫기 버튼 클릭 시 모달이 닫힘', async () => {
      renderCardDetailModal();
      
      const closeButton = screen.getByRole('button', { name: /닫기|close/i });
      await user.click(closeButton);
      
      expect(mockCloseModal).toHaveBeenCalled();
    });

    it('ESC 키 누르면 모달이 닫힘', async () => {
      renderCardDetailModal();
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      expect(mockCloseModal).toHaveBeenCalled();
    });

    it('모달 외부 클릭 시 모달이 닫힘', async () => {
      renderCardDetailModal();
      
      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);
      
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  describe('📝 카드 생성 모드', () => {
    beforeEach(() => {
      // 새 카드 생성 모드로 설정
      jest.doMock('@/store/uiStore', () => ({
        useCardDetailModal: () => ({
          isOpen: true,
          selectedCardId: null, // null이면 생성 모드
          close: mockCloseModal
        })
      }));
    });

    it('새 카드 생성 폼이 표시됨', () => {
      renderCardDetailModal({ card: null });
      
      expect(screen.getByText('새 카드 생성')).toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toHaveValue('');
      expect(screen.getByLabelText('설명')).toHaveValue('');
    });

    it('필수 필드 유효성 검사', async () => {
      renderCardDetailModal({ card: null });
      
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);
      
      expect(screen.getByText('제목은 필수입니다')).toBeInTheDocument();
      expect(screen.getByText('설명은 필수입니다')).toBeInTheDocument();
      expect(screen.getByText('담당자는 필수입니다')).toBeInTheDocument();
      
      expect(mockCreateCard).not.toHaveBeenCalled();
    });

    it('유효한 데이터로 카드 생성 성공', async () => {
      renderCardDetailModal({ card: null });
      
      // 폼 입력
      await user.type(screen.getByLabelText('제목'), '새로운 기능 개발');
      await user.type(screen.getByLabelText('설명'), '새로운 기능을 개발합니다');
      
      // 담당자 선택
      const assigneeSelect = screen.getByLabelText('담당자');
      await user.click(assigneeSelect);
      await user.click(screen.getByText('김개발'));
      
      // 우선순위 선택
      const prioritySelect = screen.getByLabelText('우선순위');
      await user.click(prioritySelect);
      await user.click(screen.getByText('높음'));
      
      // 저장
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockCreateCard).toHaveBeenCalledWith({
          title: '새로운 기능 개발',
          description: '새로운 기능을 개발합니다',
          assigneeId: 'user-1',
          priority: 'high',
          tags: [],
          dueDate: undefined,
          estimatedHours: undefined
        });
      });
    });

    it('태그 추가/제거 기능', async () => {
      renderCardDetailModal({ card: null });
      
      const tagInput = screen.getByLabelText('태그');
      
      // 태그 추가
      await user.type(tagInput, 'frontend');
      await user.keyboard('{Enter}');
      
      expect(screen.getByText('frontend')).toBeInTheDocument();
      
      // 태그 추가 (두 번째)
      await user.type(tagInput, 'react');
      await user.keyboard('{Enter}');
      
      expect(screen.getByText('react')).toBeInTheDocument();
      
      // 태그 제거
      const removeTagButton = within(screen.getByText('frontend').closest('span')!)
        .getByRole('button');
      await user.click(removeTagButton);
      
      expect(screen.queryByText('frontend')).not.toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
    });

    it('마감일 설정', async () => {
      renderCardDetailModal({ card: null });
      
      const dueDateInput = screen.getByLabelText('마감일');
      await user.type(dueDateInput, '2025-01-31');
      
      expect(dueDateInput).toHaveValue('2025-01-31');
    });

    it('예상 시간 설정', async () => {
      renderCardDetailModal({ card: null });
      
      const estimatedHoursInput = screen.getByLabelText('예상 시간');
      await user.type(estimatedHoursInput, '16');
      
      expect(estimatedHoursInput).toHaveValue(16);
    });
  });

  describe('✏️ 카드 수정 모드', () => {
    it('기존 카드 데이터가 폼에 로드됨', () => {
      renderCardDetailModal();
      
      expect(screen.getByText('카드 수정')).toBeInTheDocument();
      expect(screen.getByDisplayValue('사용자 로그인 기능 구현')).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockCards[0].description)).toBeInTheDocument();
      expect(screen.getByText('김개발')).toBeInTheDocument(); // 담당자
    });

    it('카드 정보 수정 후 저장', async () => {
      renderCardDetailModal();
      
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 제목');
      
      const descriptionInput = screen.getByLabelText('설명');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, '수정된 설명');
      
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockUpdateCard).toHaveBeenCalledWith({
          id: 'card-1',
          title: '수정된 제목',
          description: '수정된 설명',
          assigneeId: 'user-1',
          priority: 'high',
          reviewerIds: ['user-2', 'user-3'],
          dependencyIds: ['dep-1'],
          tags: ['authentication', 'security', 'frontend'],
          dueDate: '2025-01-20T23:59:59Z',
          estimatedHours: 16
        });
      });
    });

    it('리뷰어 추가/제거', async () => {
      renderCardDetailModal();
      
      // 기존 리뷰어 확인
      expect(screen.getByText('박프론트')).toBeInTheDocument();
      expect(screen.getByText('이백엔드')).toBeInTheDocument();
      
      // 리뷰어 제거
      const removeReviewerButton = within(
        screen.getByText('박프론트').closest('[data-testid="reviewer-item"]')!
      ).getByRole('button', { name: /제거/i });
      
      await user.click(removeReviewerButton);
      
      expect(screen.queryByText('박프론트')).not.toBeInTheDocument();
      
      // 새 리뷰어 추가
      const addReviewerButton = screen.getByRole('button', { name: '리뷰어 추가' });
      await user.click(addReviewerButton);
      
      const reviewerSelect = screen.getByLabelText('리뷰어 선택');
      await user.click(reviewerSelect);
      await user.click(screen.getByText('최PO'));
      
      expect(screen.getByText('최PO')).toBeInTheDocument();
    });

    it('의존성 추가/제거', async () => {
      renderCardDetailModal();
      
      // 기존 의존성 확인
      expect(screen.getByText('API 인증 시스템 구축')).toBeInTheDocument();
      
      // 의존성 제거
      const removeDependencyButton = within(
        screen.getByText('API 인증 시스템 구축').closest('[data-testid="dependency-item"]')!
      ).getByRole('button', { name: /제거/i });
      
      await user.click(removeDependencyButton);
      
      expect(screen.queryByText('API 인증 시스템 구축')).not.toBeInTheDocument();
      
      // 새 의존성 추가
      const addDependencyButton = screen.getByRole('button', { name: '의존성 추가' });
      await user.click(addDependencyButton);
      
      const dependencySelect = screen.getByLabelText('의존성 선택');
      await user.click(dependencySelect);
      await user.click(screen.getByText('데이터베이스 스키마 설계'));
      
      expect(screen.getByText('데이터베이스 스키마 설계')).toBeInTheDocument();
    });
  });

  describe('🚨 Edge Cases', () => {
    it('제목 길이 제한 (100자)', async () => {
      renderCardDetailModal({ card: null });
      
      const longTitle = 'a'.repeat(101);
      const titleInput = screen.getByLabelText('제목');
      
      await user.type(titleInput, longTitle);
      
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);
      
      expect(screen.getByText('제목은 100자 이하여야 합니다')).toBeInTheDocument();
      expect(mockCreateCard).not.toHaveBeenCalled();
    });

    it('음수 예상 시간 입력 시 유효성 검사', async () => {
      renderCardDetailModal({ card: null });
      
      const estimatedHoursInput = screen.getByLabelText('예상 시간');
      await user.type(estimatedHoursInput, '-5');
      
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);
      
      expect(screen.getByText('예상 시간은 0 이상이어야 합니다')).toBeInTheDocument();
    });

    it('잘못된 날짜 형식 입력 시 유효성 검사', async () => {
      renderCardDetailModal({ card: null });
      
      const dueDateInput = screen.getByLabelText('마감일');
      await user.type(dueDateInput, '잘못된날짜');
      
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);
      
      expect(screen.getByText('올바른 날짜 형식이 아닙니다')).toBeInTheDocument();
    });

    it('동일한 리뷰어 중복 추가 방지', async () => {
      renderCardDetailModal();
      
      // 이미 존재하는 리뷰어를 다시 추가 시도
      const addReviewerButton = screen.getByRole('button', { name: '리뷰어 추가' });
      await user.click(addReviewerButton);
      
      const reviewerSelect = screen.getByLabelText('리뷰어 선택');
      await user.click(reviewerSelect);
      
      // 이미 선택된 리뷰어는 옵션에 나타나지 않아야 함
      expect(screen.queryByText('박프론트')).not.toBeInTheDocument();
    });

    it('자기 자신을 리뷰어로 추가 방지', async () => {
      renderCardDetailModal();
      
      const addReviewerButton = screen.getByRole('button', { name: '리뷰어 추가' });
      await user.click(addReviewerButton);
      
      const reviewerSelect = screen.getByLabelText('리뷰어 선택');
      await user.click(reviewerSelect);
      
      // 담당자(김개발)는 리뷰어 옵션에 나타나지 않아야 함
      expect(screen.queryByText('김개발')).not.toBeInTheDocument();
    });

    it('순환 의존성 추가 방지', async () => {
      const cardWithSelfDependency = {
        ...mockCards[0],
        dependencies: [
          {
            id: mockCards[0].id, // 자기 자신
            title: mockCards[0].title,
            status: 'in_progress' as const,
            required: true
          }
        ]
      };
      
      renderCardDetailModal({ card: cardWithSelfDependency });
      
      const addDependencyButton = screen.getByRole('button', { name: '의존성 추가' });
      await user.click(addDependencyButton);
      
      const dependencySelect = screen.getByLabelText('의존성 선택');
      await user.click(dependencySelect);
      
      // 자기 자신은 의존성 옵션에 나타나지 않아야 함
      expect(screen.queryByText('사용자 로그인 기능 구현')).not.toBeInTheDocument();
    });

    it('네트워크 에러 시 에러 메시지 표시', async () => {
      const mockCreateCardWithError = jest.fn().mockImplementation(() => {
        throw new Error('Network Error');
      });
      
      jest.doMock('@/hooks/useCardMutations', () => ({
        useCreateCardMutation: () => ({
          mutate: mockCreateCardWithError,
          isPending: false
        })
      }));
      
      renderCardDetailModal({ card: null });
      
      // 유효한 데이터 입력
      await user.type(screen.getByLabelText('제목'), '테스트 카드');
      await user.type(screen.getByLabelText('설명'), '테스트 설명');
      
      const assigneeSelect = screen.getByLabelText('담당자');
      await user.click(assigneeSelect);
      await user.click(screen.getByText('김개발'));
      
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('카드 저장 중 오류가 발생했습니다: Network Error')).toBeInTheDocument();
      });
    });

    it('로딩 중 저장 버튼 비활성화', () => {
      jest.doMock('@/hooks/useCardMutations', () => ({
        useCreateCardMutation: () => ({
          mutate: mockCreateCard,
          isPending: true // 로딩 상태
        })
      }));
      
      renderCardDetailModal({ card: null });
      
      const saveButton = screen.getByRole('button', { name: '저장 중...' });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('📱 접근성', () => {
    it('폼 라벨과 입력 필드가 올바르게 연결됨', () => {
      renderCardDetailModal();
      
      const titleInput = screen.getByLabelText('제목');
      const descriptionInput = screen.getByLabelText('설명');
      const assigneeSelect = screen.getByLabelText('담당자');
      
      expect(titleInput).toHaveAttribute('id');
      expect(descriptionInput).toHaveAttribute('id');
      expect(assigneeSelect).toHaveAttribute('id');
    });

    it('필수 필드가 aria-required로 표시됨', () => {
      renderCardDetailModal({ card: null });
      
      expect(screen.getByLabelText('제목')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('설명')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText('담당자')).toHaveAttribute('aria-required', 'true');
    });

    it('에러 메시지가 aria-describedby로 연결됨', async () => {
      renderCardDetailModal({ card: null });
      
      const saveButton = screen.getByRole('button', { name: '저장' });
      await user.click(saveButton);
      
      const titleInput = screen.getByLabelText('제목');
      const errorMessage = screen.getByText('제목은 필수입니다');
      
      expect(titleInput).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveAttribute('id');
    });

    it('키보드 내비게이션 지원', async () => {
      renderCardDetailModal();
      
      // Tab 키로 포커스 이동
      await user.tab();
      expect(screen.getByLabelText('제목')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText('설명')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText('담당자')).toHaveFocus();
    });
  });
});
