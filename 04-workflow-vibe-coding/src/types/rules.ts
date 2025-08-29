// 워크플로우 규칙 관리 시스템 타입 정의
// FSTC-16: 워크플로우 규칙 관리 기능 구현

import { z } from 'zod';

// 규칙 타입 정의
export type RuleType = 'dependency' | 'reviewer';

// 규칙 상태 인터페이스
export interface RuleState {
  isDependencyCheckEnabled: boolean;
  isReviewerCheckEnabled: boolean;
  toggleDependencyCheck: () => void;
  toggleReviewerCheck: () => void;
  resetToDefaults: () => void;
}

// 알림 메시지 타입
export interface NotificationMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}

// 규칙 변경 알림 컨텍스트
export interface RuleChangeNotification {
  ruleName: RuleType;
  enabled: boolean;
  impact: string; // 사용자에게 미치는 영향 설명
  message: NotificationMessage;
}

// 카드 이동 실패 알림 컨텍스트
export interface MoveFailureNotification {
  cardTitle: string;
  fromStatus: string;
  toStatus: string;
  reason: string;
  suggestion?: string; // 해결 방법 제안
  message: NotificationMessage;
}

// 카드 이동 성공 알림 컨텍스트
export interface MoveSuccessNotification {
  cardTitle: string;
  fromStatus: string;
  toStatus: string;
  message: NotificationMessage;
}

// 규칙 설정 모달 상태
export interface RuleSettingsModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

// 규칙 메타데이터 (UI 표시용)
export interface RuleMetadata {
  id: RuleType;
  name: string;
  description: string;
  enabledDescription: string;
  disabledDescription: string;
  icon: string;
}

// 규칙 설정 컨텍스트 (localStorage 저장용)
export interface RuleSettings {
  isDependencyCheckEnabled: boolean;
  isReviewerCheckEnabled: boolean;
  lastUpdated: string;
  version: string; // 설정 스키마 버전
}

// Zod 스키마 정의
export const RuleTypeSchema = z.enum(['dependency', 'reviewer']);

export const NotificationMessageSchema = z.object({
  type: z.enum(['success', 'error', 'info', 'warning']),
  title: z.string().min(1, '알림 제목은 필수입니다'),
  description: z.string().optional(),
  duration: z.number().positive().optional()
});

export const RuleChangeNotificationSchema = z.object({
  ruleName: RuleTypeSchema,
  enabled: z.boolean(),
  impact: z.string().min(1, '영향 설명은 필수입니다'),
  message: NotificationMessageSchema
});

export const RuleSettingsSchema = z.object({
  isDependencyCheckEnabled: z.boolean(),
  isReviewerCheckEnabled: z.boolean(),
  lastUpdated: z.string().datetime('올바른 날짜 형식이 아닙니다'),
  version: z.string().min(1, '버전 정보는 필수입니다')
});

// 타입 추출 (Zod 스키마에서 TypeScript 타입 생성)
export type RuleChangeNotificationInput = z.infer<typeof RuleChangeNotificationSchema>;
export type RuleSettingsInput = z.infer<typeof RuleSettingsSchema>;

// 규칙 메타데이터 상수
export const RULE_METADATA: Record<RuleType, RuleMetadata> = {
  dependency: {
    id: 'dependency',
    name: '의존성 검사',
    description: '카드 이동 시 의존성 완료 여부를 검증합니다',
    enabledDescription: '의존 카드가 QA 완료되어야만 이동할 수 있습니다',
    disabledDescription: '의존성과 관계없이 자유롭게 카드를 이동할 수 있습니다',
    icon: 'link'
  },
  reviewer: {
    id: 'reviewer',
    name: '필수 리뷰어 검사',
    description: 'QA 요청 전 최소 리뷰어 수를 검증합니다',
    enabledDescription: 'QA 요청 전 리뷰어 2명을 반드시 지정해야 합니다',
    disabledDescription: '리뷰어 지정 없이도 QA 요청할 수 있습니다',
    icon: 'users'
  }
};

// 기본 규칙 설정값
export const DEFAULT_RULE_SETTINGS: RuleSettings = {
  isDependencyCheckEnabled: true,
  isReviewerCheckEnabled: true,
  lastUpdated: new Date().toISOString(),
  version: '1.0.0'
};

// localStorage 키 상수
export const RULE_SETTINGS_STORAGE_KEY = 'rule-settings-storage';

