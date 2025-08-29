// 워크플로우 규칙 관리 알림 시스템
// FSTC-16: 사용자 알림 기능 구현

import { toast } from 'sonner';
import { 
  RuleType, 
  NotificationMessage,
  RuleChangeNotification,
  MoveFailureNotification,
  MoveSuccessNotification,
  RULE_METADATA 
} from '@/types/rules';
import { CardStatus } from '@/types/workflow';

// 상태 이름 매핑 (사용자 친화적 표시)
const STATUS_DISPLAY_NAMES: Record<CardStatus, string> = {
  backlog: '백로그',
  in_progress: '개발 중',
  ready_for_qa: 'QA 요청',
  qa_done: 'QA 완료',
  ready_for_deploy: '배포 승인',
  done: '배포 완료'
};

/**
 * 규칙 변경 알림 메시지 생성
 * @param ruleName 규칙 타입
 * @param enabled 규칙 활성화 여부
 * @returns 규칙 변경 알림 컨텍스트
 */
export function createRuleChangeNotification(
  ruleName: RuleType, 
  enabled: boolean
): RuleChangeNotification {
  const ruleMetadata = RULE_METADATA[ruleName];
  const status = enabled ? '활성화' : '비활성화';
  const icon = enabled ? '✅' : '⚠️';
  const type = enabled ? 'success' : 'warning';
  const description = enabled ? ruleMetadata.enabledDescription : ruleMetadata.disabledDescription;

  return {
    ruleName,
    enabled,
    impact: description,
    message: {
      type,
      title: `${icon} ${ruleMetadata.name}가 ${status}되었습니다`,
      description,
      duration: enabled ? 3000 : 4000 // 비활성화 시 조금 더 오래 표시
    }
  };
}

/**
 * 카드 이동 성공 알림 메시지 생성
 * @param cardTitle 카드 제목
 * @param fromStatus 이전 상태
 * @param toStatus 새로운 상태
 * @returns 이동 성공 알림 컨텍스트
 */
export function createMoveSuccessNotification(
  cardTitle: string,
  fromStatus: CardStatus,
  toStatus: CardStatus
): MoveSuccessNotification {
  const fromDisplayName = STATUS_DISPLAY_NAMES[fromStatus];
  const toDisplayName = STATUS_DISPLAY_NAMES[toStatus];

  return {
    cardTitle,
    fromStatus: fromDisplayName,
    toStatus: toDisplayName,
    message: {
      type: 'success',
      title: `✅ 카드 이동 완료`,
      description: `'${cardTitle}'이(가) ${fromDisplayName}에서 ${toDisplayName}(으)로 이동되었습니다`,
      duration: 3000
    }
  };
}

/**
 * 카드 이동 실패 알림 메시지 생성
 * @param cardTitle 카드 제목
 * @param fromStatus 이전 상태
 * @param toStatus 목표 상태
 * @param reason 실패 사유
 * @param suggestion 해결 방법 제안 (선택적)
 * @returns 이동 실패 알림 컨텍스트
 */
export function createMoveFailureNotification(
  cardTitle: string,
  fromStatus: CardStatus,
  toStatus: CardStatus,
  reason: string,
  suggestion?: string
): MoveFailureNotification {
  const fromDisplayName = STATUS_DISPLAY_NAMES[fromStatus];
  const toDisplayName = STATUS_DISPLAY_NAMES[toStatus];

  // 실패 사유에 따른 제안 메시지 생성
  let autoSuggestion = suggestion;
  if (!autoSuggestion) {
    if (reason.includes('의존성')) {
      autoSuggestion = '의존 카드를 먼저 완료하거나, 설정에서 의존성 검사를 비활성화하세요.';
    } else if (reason.includes('리뷰어')) {
      autoSuggestion = '필요한 수만큼 리뷰어를 지정하거나, 설정에서 리뷰어 검사를 비활성화하세요.';
    } else if (reason.includes('권한')) {
      autoSuggestion = '적절한 권한을 가진 사용자로 전환하세요.';
    }
  }

  const description = autoSuggestion 
    ? `${reason} ${autoSuggestion}`
    : reason;

  return {
    cardTitle,
    fromStatus: fromDisplayName,
    toStatus: toDisplayName,
    reason,
    suggestion: autoSuggestion,
    message: {
      type: 'error',
      title: `❌ 카드 이동 실패`,
      description,
      duration: 5000 // 실패 메시지는 더 오래 표시
    }
  };
}

/**
 * 토스트 알림 표시
 * @param notification 알림 메시지
 */
export function showNotification(notification: NotificationMessage): void {
  const { type, title, description, duration } = notification;
  
  const options = {
    description,
    duration: duration || 4000,
    position: 'top-right' as const,
  };

  switch (type) {
    case 'success':
      toast.success(title, options);
      break;
    case 'error':
      toast.error(title, options);
      break;
    case 'warning':
      toast.warning(title, options);
      break;
    case 'info':
    default:
      toast.info(title, options);
      break;
  }
}

/**
 * 규칙 변경 알림 표시 (편의 함수)
 * @param ruleName 규칙 타입
 * @param enabled 규칙 활성화 여부
 */
export function showRuleChangeNotification(ruleName: RuleType, enabled: boolean): void {
  const notification = createRuleChangeNotification(ruleName, enabled);
  showNotification(notification.message);
  
  // 콘솔 로그 (디버깅용)
  console.log(`🔧 규칙 변경: ${ruleName} = ${enabled ? 'ON' : 'OFF'}`, notification);
}

/**
 * 카드 이동 성공 알림 표시 (편의 함수)
 * @param cardTitle 카드 제목
 * @param fromStatus 이전 상태
 * @param toStatus 새로운 상태
 */
export function showMoveSuccessNotification(
  cardTitle: string,
  fromStatus: CardStatus,
  toStatus: CardStatus
): void {
  const notification = createMoveSuccessNotification(cardTitle, fromStatus, toStatus);
  showNotification(notification.message);
  
  // 콘솔 로그 (디버깅용)
  console.log(`✅ 카드 이동 성공: ${cardTitle} (${fromStatus} → ${toStatus})`, notification);
}

/**
 * 카드 이동 실패 알림 표시 (편의 함수)
 * @param cardTitle 카드 제목
 * @param fromStatus 이전 상태
 * @param toStatus 목표 상태
 * @param reason 실패 사유
 * @param suggestion 해결 방법 제안 (선택적)
 */
export function showMoveFailureNotification(
  cardTitle: string,
  fromStatus: CardStatus,
  toStatus: CardStatus,
  reason: string,
  suggestion?: string
): void {
  const notification = createMoveFailureNotification(cardTitle, fromStatus, toStatus, reason, suggestion);
  showNotification(notification.message);
  
  // 콘솔 로그 (디버깅용)
  console.error(`❌ 카드 이동 실패: ${cardTitle} (${fromStatus} → ${toStatus})`, notification);
}

/**
 * 일반 성공 알림 표시
 * @param title 알림 제목
 * @param description 알림 설명 (선택적)
 */
export function showSuccessNotification(title: string, description?: string): void {
  showNotification({
    type: 'success',
    title,
    description,
    duration: 3000
  });
}

/**
 * 일반 에러 알림 표시
 * @param title 알림 제목
 * @param description 알림 설명 (선택적)
 */
export function showErrorNotification(title: string, description?: string): void {
  showNotification({
    type: 'error',
    title,
    description,
    duration: 5000
  });
}

/**
 * 일반 정보 알림 표시
 * @param title 알림 제목
 * @param description 알림 설명 (선택적)
 */
export function showInfoNotification(title: string, description?: string): void {
  showNotification({
    type: 'info',
    title,
    description,
    duration: 4000
  });
}

