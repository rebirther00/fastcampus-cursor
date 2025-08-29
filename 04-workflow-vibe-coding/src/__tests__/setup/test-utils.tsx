/**
 * 테스트 유틸리티 함수
 * 공통 테스트 설정 및 헬퍼 함수들
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndContext } from '@dnd-kit/core';
import { WorkflowCard, WorkflowColumn, WorkflowBoard, User, Dependency } from '@/types/workflow';

// 테스트용 QueryClient 생성
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0, // cacheTime이 gcTime으로 변경됨
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// 커스텀 렌더 함수 (QueryClient 포함)
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <DndContext>
          {children}
        </DndContext>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock 데이터 팩토리 함수들
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-test',
  name: '테스트사용자',
  email: 'test@example.com',
  role: 'developer',
  avatar: '/avatars/test.jpg',
  ...overrides,
});

export const createMockDependency = (overrides: Partial<Dependency> = {}): Dependency => ({
  id: 'dep-test',
  title: '테스트 의존성',
  status: 'done',
  required: true,
  ...overrides,
});

export const createMockCard = (overrides: Partial<WorkflowCard> = {}): WorkflowCard => ({
  id: 'card-test',
  title: '테스트 카드',
  description: '테스트용 카드입니다',
  status: 'backlog',
  priority: 'medium',
  assignee: createMockUser(),
  reviewers: [],
  dependencies: [],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  tags: [],
  activityLogs: [],
  ...overrides,
});

export const createMockColumn = (overrides: Partial<WorkflowColumn> = {}): WorkflowColumn => ({
  id: 'col-test',
  title: '테스트 컬럼',
  status: 'backlog',
  cards: [],
  color: '#6B7280',
  ...overrides,
});

export const createMockBoard = (overrides: Partial<WorkflowBoard> = {}): WorkflowBoard => ({
  id: 'board-test',
  title: '테스트 보드',
  description: '테스트용 워크플로우 보드',
  columns: [
    createMockColumn({ id: 'col-1', status: 'backlog', title: '백로그' }),
    createMockColumn({ id: 'col-2', status: 'in_progress', title: '개발 중' }),
    createMockColumn({ id: 'col-3', status: 'ready_for_qa', title: 'QA 요청' }),
    createMockColumn({ id: 'col-4', status: 'qa_done', title: 'QA 완료' }),
    createMockColumn({ id: 'col-5', status: 'ready_for_deploy', title: '배포 승인' }),
    createMockColumn({ id: 'col-6', status: 'done', title: '배포 완료' }),
  ],
  members: [createMockUser()],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  settings: {
    allowSkipStages: false,
    requireReviewers: true,
    minReviewers: 2,
    enforceWipLimits: true,
  },
  ...overrides,
});

// 테스트용 상태 전이 시나리오
export const createTransitionTestCases = () => [
  // 정상적인 전이
  { from: 'backlog', to: 'in_progress', shouldAllow: true, role: 'developer' },
  { from: 'in_progress', to: 'ready_for_qa', shouldAllow: true, role: 'developer', needsReviewers: true },
  { from: 'ready_for_qa', to: 'qa_done', shouldAllow: true, role: 'developer' },
  { from: 'qa_done', to: 'ready_for_deploy', shouldAllow: true, role: 'developer' },
  { from: 'ready_for_deploy', to: 'done', shouldAllow: true, role: 'product_owner' },
  
  // 역방향 전이
  { from: 'in_progress', to: 'backlog', shouldAllow: true, role: 'developer' },
  { from: 'ready_for_qa', to: 'in_progress', shouldAllow: true, role: 'developer' },
  { from: 'qa_done', to: 'ready_for_qa', shouldAllow: true, role: 'developer' },
  { from: 'ready_for_deploy', to: 'qa_done', shouldAllow: true, role: 'developer' },
  
  // 잘못된 전이
  { from: 'backlog', to: 'ready_for_qa', shouldAllow: false, role: 'developer' },
  { from: 'backlog', to: 'done', shouldAllow: false, role: 'developer' },
  { from: 'in_progress', to: 'done', shouldAllow: false, role: 'developer' },
  { from: 'done', to: 'ready_for_deploy', shouldAllow: false, role: 'product_owner' },
  
  // 권한 부족
  { from: 'ready_for_deploy', to: 'done', shouldAllow: false, role: 'developer' },
];

// 테스트용 에러 케이스
export const createErrorTestCases = () => [
  {
    name: '리뷰어 부족',
    card: createMockCard({ 
      status: 'in_progress',
      reviewers: [createMockUser({ id: 'rev-1' })] // 1명만 (최소 2명 필요)
    }),
    transition: { from: 'in_progress', to: 'ready_for_qa' },
    expectedError: '리뷰어가 부족합니다'
  },
  {
    name: '의존성 미완료',
    card: createMockCard({
      status: 'in_progress',
      dependencies: [createMockDependency({ status: 'in_progress', required: true })],
      reviewers: [createMockUser({ id: 'rev-1' }), createMockUser({ id: 'rev-2' })]
    }),
    transition: { from: 'in_progress', to: 'ready_for_qa' },
    expectedError: '의존성이 완료되지 않았습니다'
  },
  {
    name: '권한 부족',
    card: createMockCard({ status: 'ready_for_deploy' }),
    transition: { from: 'ready_for_deploy', to: 'done' },
    role: 'developer',
    expectedError: '권한이 없습니다'
  },
  {
    name: 'WIP 제한 초과',
    card: createMockCard({ status: 'backlog' }),
    transition: { from: 'backlog', to: 'in_progress' },
    wipExceeded: true,
    expectedError: 'WIP 제한을 초과합니다'
  }
];

// 드래그 앤 드롭 시뮬레이션 헬퍼
export const simulateDragAndDrop = (
  dragElement: HTMLElement,
  dropElement: HTMLElement
) => {
  // DragStart
  const dragStartEvent = new CustomEvent('dragstart', {
    bubbles: true,
    cancelable: true,
  });
  
  Object.defineProperty(dragStartEvent, 'dataTransfer', {
    value: {
      setData: jest.fn(),
      getData: jest.fn(),
      types: [],
      files: [],
      items: [],
      effectAllowed: 'all',
      dropEffect: 'move',
    },
  });
  
  dragElement.dispatchEvent(dragStartEvent);
  
  // DragOver
  const dragOverEvent = new CustomEvent('dragover', {
    bubbles: true,
    cancelable: true,
  });
  
  dropElement.dispatchEvent(dragOverEvent);
  
  // Drop
  const dropEvent = new CustomEvent('drop', {
    bubbles: true,
    cancelable: true,
  });
  
  Object.defineProperty(dropEvent, 'dataTransfer', {
    value: {
      setData: jest.fn(),
      getData: jest.fn(),
      types: [],
      files: [],
      items: [],
      effectAllowed: 'all',
      dropEffect: 'move',
    },
  });
  
  dropElement.dispatchEvent(dropEvent);
  
  // DragEnd
  const dragEndEvent = new CustomEvent('dragend', {
    bubbles: true,
    cancelable: true,
  });
  
  dragElement.dispatchEvent(dragEndEvent);
};

// 폼 입력 헬퍼
export const fillCardForm = async (
  user: ReturnType<typeof import('@testing-library/user-event').default.setup>,
  data: {
    title?: string;
    description?: string;
    assignee?: string;
    priority?: string;
    reviewers?: string[];
    dependencies?: string[];
    tags?: string[];
    dueDate?: string;
    estimatedHours?: number;
  }
) => {
  const { screen } = await import('@testing-library/react');
  
  if (data.title) {
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, data.title);
  }
  
  if (data.description) {
    const descInput = screen.getByLabelText('설명');
    await user.clear(descInput);
    await user.type(descInput, data.description);
  }
  
  if (data.assignee) {
    const assigneeSelect = screen.getByLabelText('담당자');
    await user.click(assigneeSelect);
    await user.click(screen.getByText(data.assignee));
  }
  
  if (data.priority) {
    const prioritySelect = screen.getByLabelText('우선순위');
    await user.click(prioritySelect);
    await user.click(screen.getByText(data.priority));
  }
  
  if (data.reviewers) {
    for (const reviewer of data.reviewers) {
      const addButton = screen.getByRole('button', { name: '리뷰어 추가' });
      await user.click(addButton);
      
      const reviewerSelect = screen.getByLabelText('리뷰어 선택');
      await user.click(reviewerSelect);
      await user.click(screen.getByText(reviewer));
    }
  }
  
  if (data.dependencies) {
    for (const dependency of data.dependencies) {
      const addButton = screen.getByRole('button', { name: '의존성 추가' });
      await user.click(addButton);
      
      const depSelect = screen.getByLabelText('의존성 선택');
      await user.click(depSelect);
      await user.click(screen.getByText(dependency));
    }
  }
  
  if (data.tags) {
    const tagInput = screen.getByLabelText('태그');
    for (const tag of data.tags) {
      await user.type(tagInput, tag);
      await user.keyboard('{Enter}');
    }
  }
  
  if (data.dueDate) {
    const dueDateInput = screen.getByLabelText('마감일');
    await user.type(dueDateInput, data.dueDate);
  }
  
  if (data.estimatedHours) {
    const hoursInput = screen.getByLabelText('예상 시간');
    await user.type(hoursInput, data.estimatedHours.toString());
  }
};

// 테스트 대기 헬퍼  
export const waitForToast = async (type: 'success' | 'error', message?: string) => {
  const { waitFor } = await import('@testing-library/react');
  // sonner는 jest.setup.js에서 이미 모킹됨
  const toast = (global as Record<string, unknown>).toast as { 
    success: jest.MockedFunction<(message: string) => void>; 
    error: jest.MockedFunction<(message: string) => void>;
  } || { success: jest.fn(), error: jest.fn() };
  
  await waitFor(() => {
    expect(toast[type]).toHaveBeenCalled();
    if (message) {
      expect(toast[type]).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
    }
  });
};

// 테스트 정리 헬퍼
export const cleanupTest = () => {
  jest.clearAllMocks();
  // 추가 정리 로직이 필요하면 여기에 추가
};

// 커스텀 매처 (선택사항)
if (typeof expect !== 'undefined') {
  expect.extend({
    toBeInColumn(card: HTMLElement, columnTestId: string) {
      const column = document.querySelector(`[data-testid="${columnTestId}"]`);
      const pass = column?.contains(card) ?? false;
      
      return {
        message: () => 
          pass 
            ? `Expected card not to be in column ${columnTestId}`
            : `Expected card to be in column ${columnTestId}`,
        pass,
      };
    },
  });
}

// TypeScript 타입 확장
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInColumn(columnTestId: string): R;
    }
  }
}
