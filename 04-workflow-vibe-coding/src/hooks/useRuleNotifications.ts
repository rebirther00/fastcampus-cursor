// 워크플로우 규칙 알림 관리 훅
// FSTC-16: 사용자 알림 기능 구현

import { useCallback } from 'react';
import { CardStatus, WorkflowCard } from '@/types/workflow';
import { 
  showMoveSuccessNotification,
  showMoveFailureNotification,
  showRuleChangeNotification,
  showSuccessNotification,
  showErrorNotification 
} from '@/lib/notifications';
import { useRuleStore } from '@/store/ruleStore';

/**
 * 규칙 관련 알림 관리 훅
 * 
 * 기능:
 * - 카드 이동 성공/실패 알림
 * - 규칙 변경 알림
 * - 일반 알림 유틸리티
 */
export function useRuleNotifications() {
  const ruleStore = useRuleStore();

  /**
   * 카드 이동 성공 알림
   */
  const notifyMoveSuccess = useCallback((
    card: WorkflowCard,
    fromStatus: CardStatus,
    toStatus: CardStatus
  ) => {
    showMoveSuccessNotification(card.title, fromStatus, toStatus);
  }, []);

  /**
   * 카드 이동 실패 알림
   */
  const notifyMoveFailure = useCallback((
    card: WorkflowCard,
    fromStatus: CardStatus,
    toStatus: CardStatus,
    reason: string,
    suggestion?: string
  ) => {
    showMoveFailureNotification(card.title, fromStatus, toStatus, reason, suggestion);
  }, []);

  /**
   * 규칙 변경 알림 (수동 트리거용)
   */
  const notifyRuleChange = useCallback((
    ruleName: 'dependency' | 'reviewer',
    enabled: boolean
  ) => {
    showRuleChangeNotification(ruleName, enabled);
  }, []);

  /**
   * 규칙 초기화 완료 알림
   */
  const notifyRuleReset = useCallback(() => {
    showSuccessNotification(
      '🔄 규칙 설정 초기화',
      '모든 규칙이 기본값으로 초기화되었습니다'
    );
  }, []);

  /**
   * 설정 저장 완료 알림
   */
  const notifySettingsSaved = useCallback(() => {
    showSuccessNotification(
      '💾 설정 저장 완료',
      '규칙 설정이 저장되었습니다'
    );
  }, []);

  /**
   * 설정 로드 실패 알림
   */
  const notifySettingsLoadError = useCallback(() => {
    showErrorNotification(
      '⚠️ 설정 로드 실패',
      '저장된 설정을 불러올 수 없어 기본값으로 초기화됩니다'
    );
  }, []);

  /**
   * 권한 부족 알림
   */
  const notifyInsufficientPermissions = useCallback((action: string) => {
    showErrorNotification(
      '🔒 권한 부족',
      `${action}을(를) 수행할 권한이 없습니다. 프로덕트 오너로 전환하세요.`
    );
  }, []);

  /**
   * 현재 규칙 상태 요약 알림 (디버깅/정보 제공용)
   */
  const notifyCurrentRuleStatus = useCallback(() => {
    const { isDependencyCheckEnabled, isReviewerCheckEnabled } = ruleStore;
    
    const status = [
      `의존성 검사: ${isDependencyCheckEnabled ? 'ON' : 'OFF'}`,
      `리뷰어 검사: ${isReviewerCheckEnabled ? 'ON' : 'OFF'}`
    ].join(', ');

    showSuccessNotification(
      '📋 현재 규칙 상태',
      status
    );
  }, [ruleStore]);

  return {
    // 카드 이동 관련 알림
    notifyMoveSuccess,
    notifyMoveFailure,
    
    // 규칙 변경 관련 알림
    notifyRuleChange,
    notifyRuleReset,
    notifyCurrentRuleStatus,
    
    // 설정 관련 알림
    notifySettingsSaved,
    notifySettingsLoadError,
    
    // 권한 관련 알림
    notifyInsufficientPermissions
  };
}

/**
 * 카드 이동 알림 전용 훅 (간소화된 버전)
 */
export function useCardMoveNotifications() {
  const { notifyMoveSuccess, notifyMoveFailure } = useRuleNotifications();
  
  /**
   * 카드 이동 결과에 따른 자동 알림
   */
  const notifyMoveResult = useCallback((
    card: WorkflowCard,
    fromStatus: CardStatus,
    toStatus: CardStatus,
    success: boolean,
    reason?: string,
    suggestion?: string
  ) => {
    if (success) {
      notifyMoveSuccess(card, fromStatus, toStatus);
    } else {
      notifyMoveFailure(card, fromStatus, toStatus, reason || '알 수 없는 오류', suggestion);
    }
  }, [notifyMoveSuccess, notifyMoveFailure]);

  return {
    notifyMoveResult,
    notifyMoveSuccess,
    notifyMoveFailure
  };
}

