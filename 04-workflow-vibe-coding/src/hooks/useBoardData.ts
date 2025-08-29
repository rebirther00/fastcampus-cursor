// 워크플로우 보드 데이터 관리 커스텀 훅 (TanStack Query)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowAPI, queryKeys, handleAPIError } from '@/lib/api';
import { mockWorkflowBoard, mockWorkflowBoards } from '@/lib/mock-data';
import { 
  WorkflowBoard, 
  WorkflowBoardsResponse, 
  WorkflowBoardResponse,
  CreateCardRequest,
  UpdateCardRequest 
} from '@/types/workflow';

// Mock 데이터를 비동기로 반환하는 시뮬레이션 함수
const simulateAsyncMockData = <T>(data: T, delay: number = 800): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// 모든 보드 조회 훅
export const useBoardsData = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: params?.search 
      ? queryKeys.boardSearch(params.search)
      : queryKeys.boards,
    queryFn: async (): Promise<WorkflowBoardsResponse> => {
      // 개발 환경에서는 Mock 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        const mockResponse: WorkflowBoardsResponse = {
          success: true,
          data: mockWorkflowBoards,
          total: mockWorkflowBoards.length,
          page: params?.page || 1,
          limit: params?.limit || 10,
          message: 'Mock 데이터를 성공적으로 조회했습니다.'
        };
        
        return simulateAsyncMockData(mockResponse);
      }
      
      // 프로덕션 환경에서는 실제 API 호출
      return workflowAPI.getBoards(params);
    },
    staleTime: 1000 * 60 * 5, // 5분
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

// 특정 보드 상세 조회 훅
export const useBoardData = (boardId: string | null) => {
  return useQuery({
    queryKey: boardId ? queryKeys.board(boardId) : [],
    queryFn: async (): Promise<WorkflowBoardResponse> => {
      if (!boardId) {
        throw new Error('보드 ID가 필요합니다.');
      }
      
      // 개발 환경에서는 Mock 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        const mockResponse: WorkflowBoardResponse = {
          success: true,
          data: mockWorkflowBoard,
          message: 'Mock 보드 데이터를 성공적으로 조회했습니다.'
        };
        
        return simulateAsyncMockData(mockResponse, 600);
      }
      
      // 프로덕션 환경에서는 실제 API 호출
      return workflowAPI.getBoard(boardId);
    },
    enabled: !!boardId, // boardId가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 3, // 3분
    retry: 1
  });
};

// 기본 보드 데이터 훅 (첫 번째 보드 자동 조회)
export const useDefaultBoardData = () => {
  const boardsQuery = useBoardsData({ limit: 1 });
  const firstBoardId = boardsQuery.data?.data[0]?.id;
  const boardQuery = useBoardData(firstBoardId || null);
  
  return {
    // 보드 목록 상태
    boardsLoading: boardsQuery.isLoading,
    boardsError: boardsQuery.error,
    
    // 선택된 보드 상태  
    board: boardQuery.data?.data,
    boardLoading: boardQuery.isLoading,
    boardError: boardQuery.error,
    
    // 전체 로딩 상태
    isLoading: boardsQuery.isLoading || boardQuery.isLoading,
    error: boardsQuery.error || boardQuery.error,
    
    // 유틸리티
    refetch: () => {
      boardsQuery.refetch();
      boardQuery.refetch();
    }
  };
};

// 보드 생성 뮤테이션 (향후 확장용)
export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (boardData: Partial<WorkflowBoard>) => {
      return workflowAPI.createBoard(boardData);
    },
    onSuccess: () => {
      // 보드 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
    onError: (error) => {
      console.error('보드 생성 실패:', handleAPIError(error));
    }
  });
};

// 보드 수정 뮤테이션 (향후 확장용)
export const useUpdateBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...boardData }: { id: string } & Partial<WorkflowBoard>) => {
      return workflowAPI.updateBoard(id, boardData);
    },
    onSuccess: (data, variables) => {
      // 특정 보드 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: queryKeys.board(variables.id) });
      // 보드 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
    onError: (error) => {
      console.error('보드 수정 실패:', handleAPIError(error));
    }
  });
};

// 보드 삭제 뮤테이션 (향후 확장용)
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (boardId: string) => {
      return workflowAPI.deleteBoard(boardId);
    },
    onSuccess: (data, boardId) => {
      // 삭제된 보드 캐시 제거
      queryClient.removeQueries({ queryKey: queryKeys.board(boardId) });
      // 보드 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.boards });
    },
    onError: (error) => {
      console.error('보드 삭제 실패:', handleAPIError(error));
    }
  });
};

// 에러 상태 확인 헬퍼
export const useWorkflowError = (error: unknown) => {
  if (!error) return null;
  
  return {
    message: handleAPIError(error),
    isNetworkError: error instanceof TypeError && error.message.includes('fetch'),
    isServerError: error instanceof Error && error.message.includes('500'),
    isNotFound: error instanceof Error && error.message.includes('404')
  };
};
