'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  WorkflowCard, 
  CreateCardInput, 
  UpdateCardInput,
  CardStatus 
} from '@/types/workflow';

// API 함수들 (실제 구현은 lib/api.ts에서)
import { 
  createCard, 
  updateCard, 
  deleteCard, 
  moveCard 
} from '@/lib/api';

/**
 * 카드 생성 뮤테이션 훅
 * FSTC-13: 카드 생성/수정 모달 및 폼 기능 구현
 */
export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCardInput): Promise<WorkflowCard> => {
      console.log('🚀 카드 생성 요청:', data);
      return await createCard(data);
    },
    onSuccess: (newCard) => {
      console.log('✅ 카드 생성 성공:', newCard);
      
      // 보드 데이터 무효화하여 새로 고침
      queryClient.invalidateQueries({ queryKey: ['workflow-board'] });
      
      // 토스트 알림 (선택사항)
      // toast.success(`카드 "${newCard.title}"이(가) 생성되었습니다.`);
    },
    onError: (error) => {
      console.error('❌ 카드 생성 실패:', error);
      
      // 에러 토스트 알림 (선택사항)
      // toast.error('카드 생성에 실패했습니다.');
    }
  });
}

/**
 * 카드 수정 뮤테이션 훅
 */
export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCardInput): Promise<WorkflowCard> => {
      if (!data.id) {
        throw new Error('카드 ID가 필요합니다');
      }
      
      console.log('🔄 카드 수정 요청:', data);
      return await updateCard(data.id, data);
    },
    onSuccess: (updatedCard) => {
      console.log('✅ 카드 수정 성공:', updatedCard);
      
      // 보드 데이터 무효화하여 새로 고침
      queryClient.invalidateQueries({ queryKey: ['workflow-board'] });
      
      // 토스트 알림 (선택사항)
      // toast.success(`카드 "${updatedCard.title}"이(가) 수정되었습니다.`);
    },
    onError: (error) => {
      console.error('❌ 카드 수정 실패:', error);
      
      // 에러 토스트 알림 (선택사항)
      // toast.error('카드 수정에 실패했습니다.');
    }
  });
}

/**
 * 카드 삭제 뮤테이션 훅
 */
export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cardId: string): Promise<void> => {
      console.log('🗑️ 카드 삭제 요청:', cardId);
      return await deleteCard(cardId);
    },
    onSuccess: (_, cardId) => {
      console.log('✅ 카드 삭제 성공:', cardId);
      
      // 보드 데이터 무효화하여 새로 고침
      queryClient.invalidateQueries({ queryKey: ['workflow-board'] });
      
      // 토스트 알림 (선택사항)
      // toast.success('카드가 삭제되었습니다.');
    },
    onError: (error) => {
      console.error('❌ 카드 삭제 실패:', error);
      
      // 에러 토스트 알림 (선택사항)
      // toast.error('카드 삭제에 실패했습니다.');
    }
  });
}

/**
 * 카드 이동 뮤테이션 훅
 * 드래그 앤 드롭으로 카드 상태 변경 시 사용
 */
export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      cardId, 
      newStatus, 
      newColumnId 
    }: { 
      cardId: string; 
      newStatus: CardStatus; 
      newColumnId: string; 
    }): Promise<WorkflowCard> => {
      console.log('🎯 카드 이동 요청:', { cardId, newStatus, newColumnId });
      return await moveCard(cardId, newStatus, newColumnId);
    },
    onSuccess: (movedCard, variables) => {
      console.log('✅ 카드 이동 성공:', {
        cardId: variables.cardId,
        newStatus: variables.newStatus,
        title: movedCard.title
      });
      
      // 보드 데이터 무효화하여 새로 고침
      queryClient.invalidateQueries({ queryKey: ['workflow-board'] });
      
      // 토스트 알림 (선택사항)
      // toast.success(`카드 "${movedCard.title}"이(가) 이동되었습니다.`);
    },
    onError: (error, variables) => {
      console.error('❌ 카드 이동 실패:', error, variables);
      
      // 에러 토스트 알림 (선택사항)
      // toast.error(`카드 이동에 실패했습니다: ${error.message}`);
    }
  });
}

/**
 * 카드 뮤테이션 훅 모음
 * 여러 뮤테이션을 한 번에 사용할 때 편리
 */
export function useCardMutations() {
  const createMutation = useCreateCard();
  const updateMutation = useUpdateCard();
  const deleteMutation = useDeleteCard();
  const moveMutation = useMoveCard();

  return {
    // 뮤테이션 함수들
    createCard: createMutation.mutate,
    updateCard: updateMutation.mutate,
    deleteCard: deleteMutation.mutate,
    moveCard: moveMutation.mutate,

    // 비동기 뮤테이션 함수들
    createCardAsync: createMutation.mutateAsync,
    updateCardAsync: updateMutation.mutateAsync,
    deleteCardAsync: deleteMutation.mutateAsync,
    moveCardAsync: moveMutation.mutateAsync,

    // 로딩 상태
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isMoving: moveMutation.isPending,

    // 전체 로딩 상태
    isLoading: 
      createMutation.isPending || 
      updateMutation.isPending || 
      deleteMutation.isPending || 
      moveMutation.isPending,

    // 에러 상태
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    moveError: moveMutation.error,

    // 뮤테이션 리셋
    resetCreate: createMutation.reset,
    resetUpdate: updateMutation.reset,
    resetDelete: deleteMutation.reset,
    resetMove: moveMutation.reset
  };
}
