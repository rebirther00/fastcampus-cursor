/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { 
  WorkflowCard, 
  User, 
  Priority, 
  CreateCardInput, 
  UpdateCardInput,
  CreateCardSchema,
  UpdateCardSchema,
  Dependency
} from '@/types/workflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Badge } from '@/components/atoms/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/atoms/avatar';
import { CalendarIcon, Clock, Tag, Users, AlertTriangle, X, Link2, Trash2 } from 'lucide-react';

// 폼 모드 타입
type FormMode = 'create' | 'edit';

// 폼 데이터 타입 (생성과 수정을 모두 지원)
type CardFormData = CreateCardInput & Partial<UpdateCardInput>;

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: FormMode;
  card?: WorkflowCard | null;
  availableUsers: User[];
  availableCards?: WorkflowCard[]; // 의존성 설정용 카드 목록
  onSave: (data: CardFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * 카드 상세/생성/수정 모달
 * FSTC-13: 카드 생성/수정 모달 및 폼 기능 구현
 * 
 * 기능:
 * - 새 카드 생성 (mode: 'create')
 * - 기존 카드 수정 (mode: 'edit')  
 * - React Hook Form + Zod 유효성 검사
 * - 담당자, 리뷰어, 우선순위, 태그 설정
 * - 의존성 및 마감일 설정
 */
export function CardDetailModal({
  isOpen,
  onClose,
  mode,
  card,
  availableUsers,
  availableCards = [],
  onSave,
  isLoading = false
}: CardDetailModalProps) {
  const [selectedReviewers, setSelectedReviewers] = useState<User[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<Dependency[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // 폼 스키마 선택 (모드에 따라)
  const schema = mode === 'create' ? CreateCardSchema : UpdateCardSchema;
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<CardFormData>({
    resolver: zodResolver(schema) as any,
    mode: 'onChange'
  });

  // 폼 초기값 설정
  useEffect(() => {
    if (mode === 'edit' && card) {
      // 수정 모드: 기존 카드 데이터로 초기화
      // ISO 날짜를 datetime-local 형식으로 변환
      const formatDateForInput = (isoDate?: string) => {
        if (!isoDate) return undefined;
        try {
          const date = new Date(isoDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch {
          return undefined;
        }
      };

      reset({
        id: card.id,
        title: card.title,
        description: card.description,
        assigneeId: card.assignee.id,
        priority: card.priority,
        dueDate: formatDateForInput(card.dueDate),
        estimatedHours: card.estimatedHours,
        tags: card.tags,
        reviewerIds: card.reviewers.map(r => r.id),
        dependencyIds: card.dependencies.map(d => d.id)
      });
      
      setSelectedReviewers(card.reviewers);
      setSelectedDependencies(card.dependencies);
      setTags(card.tags);
    } else if (mode === 'create') {
      // 생성 모드: 기본값으로 초기화
      reset({
        title: '',
        description: '',
        assigneeId: '',
        priority: 'medium',
        tags: [],
        dueDate: undefined,
        estimatedHours: undefined
      });
      
      setSelectedReviewers([]);
      setSelectedDependencies([]);
      setTags([]);
    }
  }, [mode, card, reset]);

  // 리뷰어 추가/제거
  const handleReviewerToggle = (user: User) => {
    const isSelected = selectedReviewers.some(r => r.id === user.id);
    let newReviewers: User[];
    
    if (isSelected) {
      newReviewers = selectedReviewers.filter(r => r.id !== user.id);
    } else {
      newReviewers = [...selectedReviewers, user];
    }
    
    setSelectedReviewers(newReviewers);
    setValue('reviewerIds', newReviewers.map(r => r.id));
  };

  // 태그 추가
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const newTags = [...tags, newTag.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setNewTag('');
    }
  };

  // 태그 제거
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  // 의존성 추가
  const handleAddDependency = (card: WorkflowCard) => {
    const dependency: Dependency = {
      id: card.id,
      title: card.title,
      status: card.status,
      required: true // 기본적으로 필수 의존성으로 설정
    };
    
    const isAlreadyAdded = selectedDependencies.some(dep => dep.id === card.id);
    if (!isAlreadyAdded) {
      const newDependencies = [...selectedDependencies, dependency];
      setSelectedDependencies(newDependencies);
      setValue('dependencyIds', newDependencies.map(dep => dep.id));
    }
  };

  // 의존성 제거
  const handleRemoveDependency = (dependencyId: string) => {
    const newDependencies = selectedDependencies.filter(dep => dep.id !== dependencyId);
    setSelectedDependencies(newDependencies);
    setValue('dependencyIds', newDependencies.map(dep => dep.id));
  };

  // 의존성 필수 여부 토글
  const handleToggleDependencyRequired = (dependencyId: string) => {
    const newDependencies = selectedDependencies.map(dep => 
      dep.id === dependencyId 
        ? { ...dep, required: !dep.required }
        : dep
    );
    setSelectedDependencies(newDependencies);
  };

  // 폼 제출
  const onSubmit = async (data: CardFormData) => {
    try {
      // datetime-local 형식을 ISO 형식으로 변환
      const processedData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        // estimatedHours는 이미 숫자로 변환됨 (Zod transform에서 처리)
      };
      
      await onSave(processedData);
      onClose();
    } catch (error) {
      console.error('카드 저장 실패:', error);
    }
  };

  // 모달 닫기 시 폼 초기화
  const handleClose = () => {
    reset();
    setSelectedReviewers([]);
    setSelectedDependencies([]);
    setTags([]);
    setNewTag('');
    onClose();
  };

  const modalTitle = mode === 'create' ? '새 카드 생성' : '카드 수정';
  const submitButtonText = mode === 'create' ? '생성' : '저장';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? (
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
            ) : (
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            )}
            {modalTitle}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              제목 <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              {...register('title')}
              placeholder="카드 제목을 입력하세요"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="카드에 대한 상세 설명을 입력하세요"
              rows={4}
              className={`w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* 담당자 & 우선순위 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 담당자 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                담당자 <span className="text-red-500">*</span>
              </label>
              <Select 
                onValueChange={(value) => setValue('assigneeId', value, { shouldValidate: true })}
                defaultValue={mode === 'edit' && card ? card.assignee.id : undefined}
              >
                <SelectTrigger className={errors.assigneeId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="담당자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="text-xs">
                            {user.name.split('').slice(0, 2).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.role === 'product_owner' ? 'PO' : 'Dev'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assigneeId && (
                <p className="text-sm text-red-500">{errors.assigneeId.message}</p>
              )}
            </div>

            {/* 우선순위 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">우선순위</label>
              <Select 
                onValueChange={(value: Priority) => setValue('priority', value, { shouldValidate: true })}
                defaultValue={mode === 'edit' && card ? card.priority : 'medium'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="우선순위를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      낮음
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      보통
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      높음
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      긴급
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 마감일 & 예상 시간 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 마감일 */}
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                마감일
              </label>
              <Input
                id="dueDate"
                type="datetime-local"
                {...register('dueDate')}
                className={errors.dueDate ? 'border-red-500' : ''}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            {/* 예상 시간 */}
            <div className="space-y-2">
              <label htmlFor="estimatedHours" className="text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                예상 시간 (시간)
              </label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                {...register('estimatedHours')}
                placeholder="0"
                className={errors.estimatedHours ? 'border-red-500' : ''}
              />
              {errors.estimatedHours && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.estimatedHours.message}
                </p>
              )}
            </div>
          </div>

          {/* 리뷰어 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Users className="w-4 h-4" />
              리뷰어 (QA 요청 시 최소 2명 필요)
            </label>
            <div className="border rounded-lg p-3 space-y-2">
              {/* 선택된 리뷰어 */}
              {selectedReviewers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedReviewers.map((reviewer) => (
                    <Badge key={reviewer.id} variant="secondary" className="flex items-center gap-1">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={reviewer.avatar} alt={reviewer.name} />
                        <AvatarFallback className="text-xs">
                          {reviewer.name.split('').slice(0, 2).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {reviewer.name}
                      <button
                        type="button"
                        onClick={() => handleReviewerToggle(reviewer)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* 리뷰어 선택 목록 */}
              <div className="grid grid-cols-2 gap-2">
                {availableUsers
                  .filter(user => !selectedReviewers.some(r => r.id === user.id))
                  .map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleReviewerToggle(user)}
                      className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 text-left"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.split('').slice(0, 2).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">
                          {user.role === 'product_owner' ? 'Product Owner' : 'Developer'}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>

              {selectedReviewers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  리뷰어를 선택해주세요
                </p>
              )}
            </div>
          </div>

          {/* 태그 */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Tag className="w-4 h-4" />
              태그
            </label>
            <div className="space-y-2">
              {/* 태그 추가 입력 */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="태그를 입력하세요"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  추가
                </Button>
              </div>

              {/* 선택된 태그 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 의존성 설정 */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Link2 className="w-4 h-4" />
              의존성 (QA 요청 시 필수 의존성이 완료되어야 함)
            </label>
            <div className="border rounded-lg p-3 space-y-2">
              {/* 선택된 의존성 */}
              {selectedDependencies.length > 0 && (
                <div className="space-y-2 mb-3">
                  {selectedDependencies.map((dependency) => (
                    <div key={dependency.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            dependency.status === 'done' ? 'bg-green-500' :
                            dependency.status === 'qa_done' ? 'bg-blue-500' :
                            dependency.status === 'ready_for_deploy' ? 'bg-purple-500' :
                            'bg-yellow-500'
                          }`} />
                          <span className="text-sm font-medium">{dependency.title}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {dependency.status === 'backlog' ? '백로그' :
                           dependency.status === 'in_progress' ? '개발 중' :
                           dependency.status === 'ready_for_qa' ? 'QA 요청' :
                           dependency.status === 'qa_done' ? 'QA 완료' :
                           dependency.status === 'ready_for_deploy' ? '배포 승인' :
                           '배포 완료'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* 필수 여부 토글 */}
                        <button
                          type="button"
                          onClick={() => handleToggleDependencyRequired(dependency.id)}
                          className={`text-xs px-2 py-1 rounded ${
                            dependency.required 
                              ? 'bg-red-100 text-red-700 border border-red-200' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {dependency.required ? '필수' : '선택'}
                        </button>
                        
                        {/* 제거 버튼 */}
                        <button
                          type="button"
                          onClick={() => handleRemoveDependency(dependency.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 의존성 추가 */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600">의존성 추가:</div>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {availableCards
                    .filter(availableCard => 
                      // 현재 편집 중인 카드 제외
                      availableCard.id !== card?.id &&
                      // 이미 선택된 의존성 제외
                      !selectedDependencies.some(dep => dep.id === availableCard.id)
                    )
                    .map((availableCard) => (
                      <button
                        key={availableCard.id}
                        type="button"
                        onClick={() => handleAddDependency(availableCard)}
                        className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 text-left text-sm"
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          availableCard.status === 'done' ? 'bg-green-500' :
                          availableCard.status === 'qa_done' ? 'bg-blue-500' :
                          availableCard.status === 'ready_for_deploy' ? 'bg-purple-500' :
                          'bg-yellow-500'
                        }`} />
                        <span className="flex-1">{availableCard.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {availableCard.status === 'backlog' ? '백로그' :
                           availableCard.status === 'in_progress' ? '개발 중' :
                           availableCard.status === 'ready_for_qa' ? 'QA 요청' :
                           availableCard.status === 'qa_done' ? 'QA 완료' :
                           availableCard.status === 'ready_for_deploy' ? '배포 승인' :
                           '배포 완료'}
                        </Badge>
                      </button>
                    ))}
                </div>

                {availableCards.filter(c => c.id !== card?.id && !selectedDependencies.some(dep => dep.id === c.id)).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    추가할 수 있는 의존성이 없습니다
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={!isValid || isLoading}
              className="min-w-[80px]"
            >
              {isLoading ? '저장 중...' : submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
