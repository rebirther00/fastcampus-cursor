'use client';

import { WorkflowBoard, WorkflowCard, CardStatus, UserRole, CreateCardInput, UpdateCardInput } from '@/types/workflow';
import { Header } from '@/components/organisms/Header';
import { Column } from '@/components/organisms/Column';
import { CardDetailModal } from '@/components/organisms/CardDetailModal';
import { 
  DndContext, 
  DragEndEvent, 
  closestCenter,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCardMoveNotifications } from '@/hooks/useRuleNotifications';
import { canMove } from '@/lib/rules';
import { useCardMutations } from '@/hooks/useCardMutations';

interface BoardTemplateProps {
  board: WorkflowBoard;
  currentUserRole?: UserRole;
}

/**
 * 워크플로우 보드 전체 레이아웃 템플릿
 * 
 * FSTC-12: 기본 UI 컴포넌트 구현 및 데이터 연동
 * FSTC-13: 내부 state로 보드 데이터 관리 및 드래그 앤 드롭 구현
 * - 헤더 + 컬럼 영역으로 구성된 레이아웃
 * - 가로 스크롤 가능한 flexbox 구조
 * - 드래그 앤 드롭으로 카드 이동 (내부 state 관리)
 * - 반응형 디자인 적용
 */
export function BoardTemplate({ board: initialBoard, currentUserRole = 'developer' }: BoardTemplateProps) {
  const { notifyMoveResult } = useCardMoveNotifications();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<WorkflowCard | null>(null);
  
  // 내부 state로 보드 데이터 관리 (최초 props에서 초기화)
  const [boardData, setBoardData] = useState<WorkflowBoard>(initialBoard);
  
  // 카드 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCard, setSelectedCard] = useState<WorkflowCard | null>(null);
  
  // 카드 뮤테이션 훅 (현재는 Mock 데이터로 동작하므로 isLoading만 사용)
  const { isLoading } = useCardMutations();
  
  // props가 변경되면 내부 state도 업데이트
  useEffect(() => {
    setBoardData(initialBoard);
  }, [initialBoard]);

  // 드래그 센서 설정 (성능 최적화)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동해야 드래그 시작 (의도치 않은 드래그 방지)
      },
    })
  );

  // 카드 찾기 헬퍼 함수
  const findCard = useCallback((cardId: string): WorkflowCard | null => {
    for (const column of boardData.columns) {
      const card = column.cards.find(c => c.id === cardId);
      if (card) return card;
    }
    return null;
  }, [boardData.columns]);

  // 컬럼 찾기 헬퍼 함수
  const findColumn = useCallback((columnId: string) => {
    return boardData.columns.find(column => column.id === columnId);
  }, [boardData.columns]);

  // 카드 이동 함수
  const moveCard = useCallback((cardId: string, newStatus: CardStatus) => {
    setBoardData(currentBoard => {
      let movedCard: WorkflowCard | null = null;

      // 1. 기존 컬럼에서 카드 제거
      const updatedColumns = currentBoard.columns.map((column) => {
        const cardIndex = column.cards.findIndex(card => card.id === cardId);
        
        if (cardIndex !== -1) {
          movedCard = {
            ...column.cards[cardIndex],
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
          
          return {
            ...column,
            cards: column.cards.filter(card => card.id !== cardId)
          };
        }
        
        return column;
      });

      // 2. 새로운 컬럼에 카드 추가
      const finalColumns = updatedColumns.map((column) => {
        if (column.status === newStatus && movedCard) {
          return {
            ...column,
            cards: [...column.cards, movedCard]
          };
        }
        return column;
      });

      // 3. 🔄 의존성 동기화: 다른 카드들의 의존성 배열에서 이동된 카드의 상태 업데이트
      const synchronizedColumns = finalColumns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => ({
          ...card,
          dependencies: card.dependencies.map((dep) => 
            dep.id === cardId 
              ? { ...dep, status: newStatus } // 의존성 카드의 상태 업데이트
              : dep
          )
        }))
      }));

      console.log('✅ 카드 이동 및 의존성 동기화 완료:', { cardId, newStatus });
      return {
        ...currentBoard,
        columns: synchronizedColumns,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // 드래그 시작 핸들러
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const cardId = event.active.id as string;
    console.log('🚀 드래그 시작:', cardId);
    setActiveId(cardId);
    
    // 드래그되는 카드 정보 저장
    const card = findCard(cardId);
    console.log('📋 드래그 카드:', card?.title);
    setDraggedCard(card);
  }, [findCard]);

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('🏁 드래그 종료:', { activeId: active.id, overId: over?.id });
    
    // 상태 초기화
    setActiveId(null);
    setDraggedCard(null);

    if (!over) {
      console.log('❌ 드롭 영역이 없습니다');
      return;
    }

    const cardId = active.id as string;
    const targetColumnId = over.id as string;
    
    console.log('🎯 드롭 대상:', { cardId, targetColumnId });
    
    // 드래그된 카드와 타겟 컬럼 찾기
    const card = findCard(cardId);
    const targetColumn = findColumn(targetColumnId);
    
    if (!card || !targetColumn) {
      toast.error('카드 또는 컬럼을 찾을 수 없습니다');
      return;
    }

    // 같은 컬럼으로 이동하는 경우 무시
    if (card.status === targetColumn.status) {
      return;
    }

    // 규칙 엔진으로 이동 가능성 검증
    console.log('🔍 규칙 검증 시작:', {
      cardTitle: card.title,
      fromStatus: card.status,
      toStatus: targetColumn.status,
      userRole: currentUserRole,
      dependencies: card.dependencies,
      reviewers: card.reviewers,
      boardSettings: boardData.settings
    });

    // 🔍 의존성 상세 디버깅
    if (card.dependencies && card.dependencies.length > 0) {
      console.log('📋 의존성 상세 정보:');
      card.dependencies.forEach((dep, index) => {
        console.log(`  ${index + 1}. "${dep.title}": status=${dep.status}, required=${dep.required}`);
      });
    }

    const ruleResult = canMove(
      card,
      card.status,
      targetColumn.status,
      currentUserRole,
      boardData.settings
    );

    console.log('✅ 규칙 검증 결과:', ruleResult);

    if (!ruleResult.allowed) {
      console.log('❌ 이동 거부:', ruleResult.reason);
      
      // FSTC-16: 이동 실패 알림 (상세 메시지 포함)
      notifyMoveResult(
        card,
        card.status,
        targetColumn.status,
        false,
        ruleResult.reason || '이동할 수 없습니다'
      );
      return;
    }

    // 카드 이동 실행
    moveCard(card.id, targetColumn.status);
    
    // FSTC-16: 성공 알림 (자동 메시지 생성)
    notifyMoveResult(
      card,
      card.status,
      targetColumn.status,
      true
    );
  }, [findCard, findColumn, currentUserRole, boardData.settings, moveCard, notifyMoveResult]);

  // 새 카드 생성 모달 열기
  const handleCreateCard = useCallback(() => {
    setModalMode('create');
    setSelectedCard(null);
    setIsModalOpen(true);
  }, []);

  // 카드 수정 모달 열기
  const handleEditCard = useCallback((card: WorkflowCard) => {
    setModalMode('edit');
    setSelectedCard(card);
    setIsModalOpen(true);
  }, []);

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCard(null);
  }, []);

  // 카드 저장 (생성/수정)
  const handleSaveCard = useCallback(async (data: CreateCardInput | UpdateCardInput) => {
    try {
      if (modalMode === 'create') {
        // 새 카드 생성
        const createData = data as CreateCardInput;
        
        // Mock으로 새 카드를 백로그 컬럼에 추가
        const cardId = `card-${Date.now()}`;
        const newCard: WorkflowCard = {
          id: cardId,
          title: createData.title,
          description: createData.description,
          status: 'backlog',
          priority: createData.priority,
          assignee: boardData.members.find(m => m.id === createData.assigneeId)!,
          reviewers: (createData as UpdateCardInput).reviewerIds 
            ? boardData.members.filter(m => (createData as UpdateCardInput).reviewerIds!.includes(m.id))
            : [],
          dependencies: (createData as UpdateCardInput).dependencyIds
            ? boardData.columns.flatMap(col => col.cards)
                .filter(card => (createData as UpdateCardInput).dependencyIds!.includes(card.id))
                .map(card => ({
                  id: card.id,
                  title: card.title,
                  status: card.status,
                  required: true
                }))
            : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          dueDate: createData.dueDate,
          estimatedHours: createData.estimatedHours,
          tags: createData.tags || [],
          activityLogs: [{
            id: `log-${Date.now()}`,
            cardId: cardId,
            userId: 'current-user',
            userName: '현재 사용자',
            action: 'created',
            timestamp: new Date().toISOString(),
            description: '카드가 생성되었습니다'
          }]
        };
        
        // 백로그 컬럼에 새 카드 추가
        setBoardData(currentBoard => ({
          ...currentBoard,
          columns: currentBoard.columns.map(column => 
            column.status === 'backlog' 
              ? { ...column, cards: [...column.cards, newCard] }
              : column
          ),
          updatedAt: new Date().toISOString()
        }));
        
        toast.success(`카드 "${newCard.title}"이(가) 생성되었습니다.`);
      } else if (modalMode === 'edit' && selectedCard) {
        // 기존 카드 수정
        const updateData = data as UpdateCardInput;
        
        setBoardData(currentBoard => ({
          ...currentBoard,
          columns: currentBoard.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
              card.id === selectedCard.id 
                                  ? {
                    ...card,
                    title: updateData.title || card.title,
                    description: updateData.description || card.description,
                    priority: updateData.priority || card.priority,
                    assignee: updateData.assigneeId 
                      ? boardData.members.find(m => m.id === updateData.assigneeId) || card.assignee
                      : card.assignee,
                    reviewers: updateData.reviewerIds
                      ? boardData.members.filter(m => updateData.reviewerIds!.includes(m.id))
                      : card.reviewers,
                    dependencies: updateData.dependencyIds
                      ? boardData.columns.flatMap(col => col.cards)
                          .filter(c => updateData.dependencyIds!.includes(c.id))
                          .map(c => ({
                            id: c.id,
                            title: c.title,
                            status: c.status,
                            required: true
                          }))
                      : card.dependencies,
                    dueDate: updateData.dueDate,
                    estimatedHours: updateData.estimatedHours,
                    tags: updateData.tags || card.tags,
                    updatedAt: new Date().toISOString()
                  }
                : card
            )
          })),
          updatedAt: new Date().toISOString()
        }));
        
        toast.success(`카드 "${selectedCard.title}"이(가) 수정되었습니다.`);
      }
    } catch (error) {
      console.error('카드 저장 실패:', error);
      toast.error('카드 저장에 실패했습니다.');
    }
  }, [modalMode, selectedCard, boardData.members, boardData.columns]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 헤더 영역 */}
      <Header board={boardData} onCreateCard={handleCreateCard} />
      
      {/* 메인 보드 영역 */}
      <main className="flex-1 overflow-hidden">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full overflow-x-auto overflow-y-hidden">
            {/* 컬럼 컨테이너 - 가로 스크롤 */}
            <div className="flex gap-6 p-6 h-full min-w-max">
              {boardData.columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  boardSettings={boardData.settings}
                  onCardClick={handleEditCard}
                />
              ))}
              
              {/* 새 컬럼 추가 영역 (향후 확장용) */}
              <div className="flex-shrink-0 w-80 opacity-50 hover:opacity-100 transition-opacity">
                <div className="h-full border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="text-2xl mb-2">+</div>
                    <div className="text-sm">새 컬럼 추가</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 드래그 오버레이 - 실제 카드 정보 표시 */}
          <DragOverlay>
            {activeId && draggedCard ? (
              <div className="transform rotate-12 opacity-90 shadow-2xl">
                <div className="bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm">
                  <div className="text-sm font-medium line-clamp-2 mb-2">
                    {draggedCard.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                      {draggedCard.priority}
                    </span>
                    <span>
                      {draggedCard.assignee.name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    드래그 중...
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* 카드 생성/수정 모달 */}
      <CardDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        card={selectedCard}
        availableUsers={boardData.members}
        availableCards={boardData.columns.flatMap(column => column.cards)}
        onSave={handleSaveCard}
        isLoading={isLoading}
      />
    </div>
  );
}
