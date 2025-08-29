/**
 * 규칙 엔진 (Rules Engine)
 * FSTC-13: 핵심 기능 및 비즈니스 로직 구현
 * 
 * 워크플로우의 핵심 규칙을 검증하는 시스템:
 * 1. 상태 전이 규칙
 * 2. 역할 기반 권한 규칙
 * 3. 의존성 규칙
 * 4. 리뷰어 규칙
 * 5. WIP 제한 규칙
 */

import { 
  WorkflowCard, 
  CardStatus,
  WorkflowBoard,
  User,
  Dependency,
  UserRole,
  STATUS_TRANSITIONS,
  ROLE_PERMISSIONS
} from '@/types/workflow';
import { useRuleStore } from '@/store/ruleStore';

// 규칙 검증 결과 타입
export interface RuleValidationResult {
  allowed: boolean;
  reason?: string;
}

// 의존성 검증 결과 타입
export interface DependencyValidationResult {
  isValid: boolean;
  pendingDependencies: Dependency[];
  circularDependencies?: string[];
}

// 리뷰어 검증 결과 타입
export interface ReviewerValidationResult {
  isValid: boolean;
  currentCount: number;
  requiredCount: number;
}

/**
 * 카드 이동 가능 여부를 검증하는 핵심 함수
 * @param card 이동할 카드
 * @param fromStatus 현재 상태
 * @param toStatus 목표 상태
 * @param currentUserRole 현재 사용자 역할
 * @param boardSettings 보드 설정
 * @returns 이동 가능 여부와 사유
 */
export function canMove(
  card: WorkflowCard,
  fromStatus: CardStatus,
  toStatus: CardStatus,
  currentUserRole: UserRole,
  boardSettings: WorkflowBoard['settings']
): RuleValidationResult {
  // 1. 기본 유효성 검사
  const basicValidation = validateBasicRules(card, fromStatus, toStatus, currentUserRole);
  if (!basicValidation.allowed) {
    return basicValidation;
  }

  // 2. 상태 전이 규칙 검증
  const transitionValidation = validateStateTransition(fromStatus, toStatus, boardSettings);
  if (!transitionValidation.allowed) {
    return transitionValidation;
  }

  // 3. 역할 기반 권한 검증
  const permissionValidation = validateRolePermissions(toStatus, currentUserRole);
  if (!permissionValidation.allowed) {
    return permissionValidation;
  }

  // 4. 의존성 규칙 검증 (QA 요청 단계로 이동 시)
  // FSTC-16: 규칙 설정에 따른 조건부 검증
  if (toStatus === 'ready_for_qa') {
    const ruleState = useRuleStore.getState();
    
    // 의존성 검사 규칙이 활성화된 경우에만 검증
    if (ruleState.isDependencyCheckEnabled) {
      const dependencyValidation = validateDependencies(card.dependencies, card.id);
      if (!dependencyValidation.isValid) {
        const pendingTitles = dependencyValidation.pendingDependencies.map(dep => dep.title).join(', ');
        return {
          allowed: false,
          reason: `의존성이 완료되지 않았습니다: ${pendingTitles}`
        };
      }
    } else {
      console.log('⚠️ 의존성 검사 규칙이 비활성화되어 있어 의존성 검증을 건너뜁니다');
    }
  }

  // 5. 리뷰어 규칙 검증 (QA 요청 단계로 이동 시)
  // FSTC-16: 규칙 설정에 따른 조건부 검증
  if (toStatus === 'ready_for_qa') {
    const ruleState = useRuleStore.getState();
    
    // 리뷰어 검사 규칙이 활성화된 경우에만 검증
    if (ruleState.isReviewerCheckEnabled && boardSettings.requireReviewers) {
      const reviewerValidation = validateReviewers(card.reviewers, boardSettings);
      if (!reviewerValidation.isValid) {
        return {
          allowed: false,
          reason: `리뷰어가 부족합니다. 현재 ${reviewerValidation.currentCount}명, 최소 ${reviewerValidation.requiredCount}명 필요`
        };
      }
    } else if (!ruleState.isReviewerCheckEnabled) {
      console.log('⚠️ 리뷰어 검사 규칙이 비활성화되어 있어 리뷰어 검증을 건너뜁니다');
    }
  }

  return { allowed: true };
}

/**
 * 기본 규칙 검증
 */
function validateBasicRules(
  card: WorkflowCard | null,
  fromStatus: CardStatus,
  toStatus: CardStatus,
  currentUserRole: UserRole
): RuleValidationResult {
  // null/undefined 카드 검사
  if (!card) {
    throw new Error('카드 정보가 필요합니다');
  }

  // 동일한 상태로의 이동 검사
  if (fromStatus === toStatus) {
    return {
      allowed: false,
      reason: '동일한 상태로는 이동할 수 없습니다'
    };
  }

  // 완료된 카드는 이동 불가
  if (fromStatus === 'done') {
    return {
      allowed: false,
      reason: '완료된 카드는 이동할 수 없습니다'
    };
  }

  // 잘못된 상태값 검사
  const validStatuses: CardStatus[] = ['backlog', 'in_progress', 'ready_for_qa', 'qa_done', 'ready_for_deploy', 'done'];
  if (!validStatuses.includes(fromStatus) || !validStatuses.includes(toStatus)) {
    return {
      allowed: false,
      reason: '잘못된 상태입니다'
    };
  }

  // 잘못된 역할값 검사
  const validRoles: UserRole[] = ['developer', 'product_owner'];
  if (!validRoles.includes(currentUserRole)) {
    return {
      allowed: false,
      reason: '잘못된 역할입니다'
    };
  }

  return { allowed: true };
}

/**
 * 상태 전이 규칙 검증
 */
function validateStateTransition(
  fromStatus: CardStatus,
  toStatus: CardStatus,
  boardSettings: WorkflowBoard['settings']
): RuleValidationResult {
  // 단계 건너뛰기 허용 여부 확인
  if (!boardSettings.allowSkipStages) {
    const allowedTransitions = STATUS_TRANSITIONS[fromStatus];
    if (!allowedTransitions.includes(toStatus)) {
      return {
        allowed: false,
        reason: '단계를 건너뛸 수 없습니다'
      };
    }
  }

  return { allowed: true };
}

/**
 * 역할 기반 권한 검증
 */
function validateRolePermissions(
  toStatus: CardStatus,
  currentUserRole: UserRole
): RuleValidationResult {
  const permissions = ROLE_PERMISSIONS[currentUserRole];
  
  if (!permissions.canMoveToStatus.includes(toStatus)) {
    // 특별히 배포 완료는 PO만 가능
    if (toStatus === 'done') {
      return {
        allowed: false,
        reason: '권한이 없습니다. 프로덕트 오너만 배포 완료로 이동할 수 있습니다'
      };
    }
    
    return {
      allowed: false,
      reason: '권한이 없습니다'
    };
  }

  return { allowed: true };
}

/**
 * 의존성 규칙 검증
 * @param dependencies 의존성 배열
 * @param cardId 현재 카드 ID (순환 의존성 검사용)
 * @returns 의존성 검증 결과
 */
export function validateDependencies(
  dependencies: Dependency[],
  cardId?: string
): DependencyValidationResult {
  console.log('🔍 의존성 검증 시작:', { dependencies, cardId });
  
  if (!dependencies || dependencies.length === 0) {
    console.log('✅ 의존성 없음 - 통과');
    return {
      isValid: true,
      pendingDependencies: []
    };
  }

  // 순환 의존성 검사
  const circularDependencies: string[] = [];
  if (cardId) {
    dependencies.forEach(dep => {
      if (dep.id === cardId) {
        circularDependencies.push(dep.id);
      }
    });
  }

  if (circularDependencies.length > 0) {
    return {
      isValid: false,
      pendingDependencies: [],
      circularDependencies
    };
  }

  // 필수 의존성 중 미완료된 것들 찾기
  // QA 완료(qa_done) 또는 배포 완료(done) 상태만 완료로 인정
  const pendingDependencies = dependencies.filter(dep => {
    const isPending = dep.required && dep.status !== 'qa_done' && dep.status !== 'done';
    console.log(`📋 의존성 "${dep.title}": required=${dep.required}, status=${dep.status}, isPending=${isPending}`);
    return isPending;
  });

  const result = {
    isValid: pendingDependencies.length === 0,
    pendingDependencies
  };

  console.log('✅ 의존성 검증 결과:', result);
  return result;
}

/**
 * 리뷰어 규칙 검증
 * @param reviewers 리뷰어 배열
 * @param boardSettings 보드 설정
 * @returns 리뷰어 검증 결과
 */
export function validateReviewers(
  reviewers: User[],
  boardSettings: WorkflowBoard['settings']
): ReviewerValidationResult {
  const currentCount = reviewers ? reviewers.length : 0;
  const requiredCount = boardSettings.minReviewers || 0;

  console.log('🔍 리뷰어 검증 시작:', {
    currentCount,
    requiredCount,
    requireReviewers: boardSettings.requireReviewers,
    reviewers: reviewers?.map(r => r.name) || []
  });

  // 리뷰어 요구사항이 비활성화된 경우
  if (!boardSettings.requireReviewers) {
    console.log('✅ 리뷰어 요구사항 비활성화 - 통과');
    return {
      isValid: true,
      currentCount,
      requiredCount: 0
    };
  }

  const result = {
    isValid: currentCount >= requiredCount,
    currentCount,
    requiredCount
  };

  console.log('✅ 리뷰어 검증 결과:', result);
  return result;
}

/**
 * WIP 제한 검증
 * @param columnCards 컬럼의 현재 카드들
 * @param maxCards 최대 카드 수
 * @param isAddingCard 카드를 추가하는지 여부
 * @returns WIP 제한 검증 결과
 */
export function validateWipLimits(
  columnCards: WorkflowCard[],
  maxCards?: number,
  isAddingCard: boolean = true
): RuleValidationResult {
  if (!maxCards || maxCards <= 0) {
    return { allowed: true };
  }

  const currentCount = columnCards.length;
  const futureCount = isAddingCard ? currentCount + 1 : currentCount;

  if (futureCount > maxCards) {
    return {
      allowed: false,
      reason: `WIP 제한을 초과합니다. 최대 ${maxCards}개의 카드만 허용됩니다`
    };
  }

  return { allowed: true };
}
