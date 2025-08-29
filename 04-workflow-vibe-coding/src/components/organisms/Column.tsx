'use client';

import { WorkflowColumn, WorkflowCard } from '@/types/workflow';
import { Card } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/badge';
import { AlertTriangle } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

interface ColumnProps {
  column: WorkflowColumn;
  boardSettings: {
    allowSkipStages: boolean;
    requireReviewers: boolean;
    minReviewers: number;
    enforceWipLimits: boolean;
  };
  onCardClick?: (card: WorkflowCard) => void;
}

/**
 * 워크플로우 컬럼
 * 
 * FSTC-12: 기본 UI 컴포넌트 구현 및 데이터 연동
 * FSTC-13: 드래그 앤 드롭 드롭 영역 구현
 * - 컬럼 제목과 카드 개수 표시
 * - WIP 제한 표시
 * - 카드 목록 렌더링
 * - 드롭 영역 제공 (@dnd-kit useDroppable)
 */
export function Column({ column, boardSettings, onCardClick }: ColumnProps) {
  const cardCount = column.cards.length;
  const isWipLimitExceeded = 
    boardSettings.enforceWipLimits && 
    column.maxCards && 
    cardCount > column.maxCards;

  // 드롭 영역 설정
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      {/* 컬럼 헤더 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            {column.title}
          </h2>
          
          <div className="flex items-center gap-2">
            {/* 카드 개수 */}
            <Badge variant="secondary" className="text-xs">
              {cardCount}
            </Badge>
            
            {/* WIP 제한 표시 */}
            {column.maxCards && (
              <Badge 
                variant={isWipLimitExceeded ? "destructive" : "outline"}
                className="text-xs flex items-center gap-1"
              >
                {isWipLimitExceeded && <AlertTriangle className="h-3 w-3" />}
                {cardCount}/{column.maxCards}
              </Badge>
            )}
          </div>
        </div>
        
        {/* WIP 제한 초과 경고 */}
        {isWipLimitExceeded && (
          <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
            WIP 제한을 초과했습니다
          </div>
        )}
      </div>

      {/* 카드 목록 - 드롭 영역 */}
      <div 
        ref={setNodeRef}
        className={`space-y-3 min-h-[200px] rounded-lg p-2 transition-colors ${
          isOver ? 'bg-primary/5 border-2 border-dashed border-primary' : ''
        }`}
      >
        {column.cards.map((card) => (
          <Card 
            key={card.id} 
            card={card}
            columnColor={column.color}
            onCardClick={onCardClick}
          />
        ))}
        
        {/* 빈 컬럼 상태 */}
        {column.cards.length === 0 && (
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isOver 
              ? 'border-primary bg-primary/10 text-primary' 
              : 'border-muted-foreground/25 text-muted-foreground'
          }`}>
            <div className="text-sm">
              {isOver ? '여기에 드롭하세요' : '카드가 없습니다'}
            </div>
            <div className="text-xs mt-1">
              {isOver ? '' : '카드를 여기로 드래그하세요'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
