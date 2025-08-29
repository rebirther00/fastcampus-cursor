// API 호출 유틸리티 함수

import { 
  WorkflowBoardResponse, 
  WorkflowBoardsResponse,
  WorkflowBoard,
  WorkflowCard,
  CreateCardInput,
  UpdateCardInput,
  CardStatus
} from '@/types/workflow';

const API_BASE_URL = '/api/workflow';

// API 호출 기본 설정
const apiCall = async <T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// 워크플로우 보드 API 함수들
export const workflowAPI = {
  // 모든 보드 조회
  getBoards: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<WorkflowBoardsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/boards${queryString ? `?${queryString}` : ''}`;
    
    return apiCall<WorkflowBoardsResponse>(endpoint);
  },

  // 특정 보드 상세 조회
  getBoard: async (id: string): Promise<WorkflowBoardResponse> => {
    return apiCall<WorkflowBoardResponse>(`/boards/${id}`);
  },

  // 보드 생성 (향후 확장용)
  createBoard: async (boardData: Partial<WorkflowBoard>): Promise<WorkflowBoardResponse> => {
    return apiCall<WorkflowBoardResponse>('/boards', {
      method: 'POST',
      body: JSON.stringify(boardData),
    });
  },

  // 보드 수정 (향후 확장용)
  updateBoard: async (
    id: string, 
    boardData: Partial<WorkflowBoard>
  ): Promise<WorkflowBoardResponse> => {
    return apiCall<WorkflowBoardResponse>(`/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(boardData),
    });
  },

  // 보드 삭제 (향후 확장용)
  deleteBoard: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiCall<{ success: boolean; message: string }>(`/boards/${id}`, {
      method: 'DELETE',
    });
  }
};

// 카드 API 함수들 (FSTC-13: 카드 생성/수정 기능)
export const createCard = async (data: CreateCardInput): Promise<WorkflowCard> => {
  return apiCall<WorkflowCard>('/cards', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCard = async (cardId: string, data: UpdateCardInput): Promise<WorkflowCard> => {
  return apiCall<WorkflowCard>(`/cards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteCard = async (cardId: string): Promise<void> => {
  return apiCall<void>(`/cards/${cardId}`, {
    method: 'DELETE',
  });
};

export const moveCard = async (
  cardId: string, 
  newStatus: CardStatus, 
  newColumnId: string
): Promise<WorkflowCard> => {
  return apiCall<WorkflowCard>(`/cards/${cardId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus, columnId: newColumnId }),
  });
};

// React Query용 쿼리 키
export const queryKeys = {
  boards: ['workflow', 'boards'] as const,
  board: (id: string) => ['workflow', 'boards', id] as const,
  boardSearch: (search: string) => ['workflow', 'boards', 'search', search] as const,
  cards: ['workflow', 'cards'] as const,
  card: (id: string) => ['workflow', 'cards', id] as const,
};

// 에러 처리 헬퍼
export const handleAPIError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
};
