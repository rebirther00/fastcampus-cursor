'use client';

import { WorkflowCard } from '@/types/workflow';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';

import { useDraggable } from '@dnd-kit/core';
import { 
  Clock, 
  MessageSquare, 
  Paperclip, 
  Users, 
  AlertCircle,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useCallback, memo } from 'react';

interface CardProps {
  card: WorkflowCard;
  columnColor?: string; // 현재 사용하지 않지만 향후 확장을 위해 optional로 유지
  onCardClick?: (card: WorkflowCard) => void;
}

/**
 * 워크플로우 카드
 * 
 * FSTC-12: 기본 UI 컴포넌트 구현 및 데이터 연동
 * - 카드 정보 표시 (제목, 담당자, 우선순위, 태그)
 * - 드래그 기능 구현
 * - 카드 클릭 시 상세 모달 열기
 * - 우선순위별 시각적 구분
 */
const CardComponent = function Card({ card, onCardClick }: CardProps) {
  
  // @dnd-kit 드래그 기능 설정
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: card.id,
  });

  // 드래그 스타일 적용 (메모이제이션)
  const style = useMemo(() => {
    if (!transform) return undefined;
    return {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      // 하드웨어 가속을 위한 추가 속성
      willChange: 'transform',
      backfaceVisibility: 'hidden' as const,
      perspective: 1000,
    };
  }, [transform]);

  // 우선순위 색상 매핑 (메모이제이션)
  const priorityColor = useMemo(() => {
    switch (card.priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }, [card.priority]);

  // 우선순위 아이콘 (메모이제이션)
  const priorityIcon = useMemo(() => {
    switch (card.priority) {
      case 'urgent': return <AlertCircle className="h-3 w-3" />;
      case 'high': return <Timer className="h-3 w-3" />;
      default: return null;
    }
  }, [card.priority]);

  // 담당자 이름 이니셜 생성 (메모이제이션)
  const initials = useMemo(() => {
    return card.assignee.name.split('').slice(0, 2).join('').toUpperCase();
  }, [card.assignee.name]);

  // 마감일 계산 (메모이제이션)
  const dateInfo = useMemo(() => {
    if (!card.dueDate) return { daysUntilDue: null, isOverdue: false, isDueSoon: false };
    
    const today = new Date();
    const due = new Date(card.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      daysUntilDue,
      isOverdue: daysUntilDue < 0,
      isDueSoon: daysUntilDue <= 2 && daysUntilDue >= 0
    };
  }, [card.dueDate]);

  // 카드 클릭 핸들러 (메모이제이션)
  const handleCardClick = useCallback(() => {
    if (onCardClick) {
      onCardClick(card);
    }
  }, [onCardClick, card]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer",
        "hover:border-primary/20",
        "gpu-accelerated", // GPU 가속
        dateInfo.isOverdue && "border-red-200 bg-red-50/50",
        dateInfo.isDueSoon && "border-yellow-200 bg-yellow-50/50",
        isDragging && "opacity-50 z-50 drag-active", // 드래그 중일 때 transition 제거
        !isDragging && "drag-smooth" // 드래그 중이 아닐 때 부드러운 transition
      )}
      onClick={handleCardClick}
    >
        {/* 우선순위 인디케이터 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className={cn("w-2 h-2 rounded-full", priorityColor)}
            />
            {(card.priority === 'urgent' || card.priority === 'high') && (
              <div className="text-muted-foreground">
                {priorityIcon}
              </div>
            )}
          </div>
          
          {/* 카드 ID */}
          <div className="text-xs text-muted-foreground font-mono">
            #{card.id.slice(-4)}
          </div>
        </div>

        {/* 카드 제목 */}
        <h3 className="font-medium text-foreground mb-2 line-clamp-2 leading-tight">
          {card.title}
        </h3>

        {/* 카드 설명 (요약) */}
        {card.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* 태그 */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {card.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{card.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* 마감일 */}
        {card.dueDate && (
          <div className={cn(
            "flex items-center gap-1 text-xs mb-3",
            dateInfo.isOverdue ? "text-red-600" : dateInfo.isDueSoon ? "text-yellow-600" : "text-muted-foreground"
          )}>
            <Clock className="h-3 w-3" />
            {dateInfo.isOverdue 
              ? `${Math.abs(dateInfo.daysUntilDue!)}일 지연`
              : dateInfo.isDueSoon 
                ? `${dateInfo.daysUntilDue}일 남음`
                : new Date(card.dueDate).toLocaleDateString('ko-KR')
            }
          </div>
        )}

        {/* 하단 정보 */}
        <div className="flex items-center justify-between">
          {/* 담당자 */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={card.assignee.avatar} alt={card.assignee.name} />
              <AvatarFallback className="text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {card.assignee.name}
            </span>
          </div>

          {/* 부가 정보 */}
          <div className="flex items-center gap-2 text-muted-foreground">
            {/* 리뷰어 */}
            {card.reviewers.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="text-xs">{card.reviewers.length}</span>
              </div>
            )}
            
            {/* 댓글 수 */}
            {card.activityLogs.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">{card.activityLogs.length}</span>
              </div>
            )}
            
            {/* 의존성 */}
            {card.dependencies.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span className="text-xs">{card.dependencies.length}</span>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

// React.memo로 감싸서 props가 변경되지 않으면 리렌더링 방지
export const Card = memo(CardComponent, (prevProps, nextProps) => {
  // 카드 데이터의 주요 속성들을 비교하여 리렌더링 여부 결정
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.title === nextProps.card.title &&
    prevProps.card.priority === nextProps.card.priority &&
    prevProps.card.dueDate === nextProps.card.dueDate &&
    prevProps.card.assignee.name === nextProps.card.assignee.name &&
    prevProps.card.tags.length === nextProps.card.tags.length &&
    prevProps.card.activityLogs.length === nextProps.card.activityLogs.length
  );
});
