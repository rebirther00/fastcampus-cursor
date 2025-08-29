// 워크플로우 규칙 관리 스토어
// FSTC-16: 워크플로우 규칙 관리 기능 구현

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  RuleState,
  RuleSettings,
  DEFAULT_RULE_SETTINGS,
  RULE_SETTINGS_STORAGE_KEY
} from '@/types/rules';
import { showRuleChangeNotification } from '@/lib/notifications';

/**
 * 규칙 설정 상태 관리 스토어
 * 
 * 기능:
 * - 의존성 검사 규칙 ON/OFF
 * - 필수 리뷰어 검사 규칙 ON/OFF  
 * - localStorage 영속화
 * - 규칙 변경 시 자동 알림
 */
export const useRuleStore = create<RuleState>()(
  persist(
    (set, get) => ({
      // 초기 상태 (기본값: 모든 규칙 활성화)
      isDependencyCheckEnabled: DEFAULT_RULE_SETTINGS.isDependencyCheckEnabled,
      isReviewerCheckEnabled: DEFAULT_RULE_SETTINGS.isReviewerCheckEnabled,

      /**
       * 의존성 검사 규칙 토글
       */
      toggleDependencyCheck: () => {
        const currentState = get().isDependencyCheckEnabled;
        const newState = !currentState;
        
        set({ isDependencyCheckEnabled: newState });
        
        // 변경 알림 표시
        showRuleChangeNotification('dependency', newState);
        
        // 디버깅 로그
        console.log(`🔧 의존성 검사 규칙: ${currentState ? 'ON' : 'OFF'} → ${newState ? 'ON' : 'OFF'}`);
      },

      /**
       * 필수 리뷰어 검사 규칙 토글
       */
      toggleReviewerCheck: () => {
        const currentState = get().isReviewerCheckEnabled;
        const newState = !currentState;
        
        set({ isReviewerCheckEnabled: newState });
        
        // 변경 알림 표시
        showRuleChangeNotification('reviewer', newState);
        
        // 디버깅 로그
        console.log(`🔧 리뷰어 검사 규칙: ${currentState ? 'ON' : 'OFF'} → ${newState ? 'ON' : 'OFF'}`);
      },

      /**
       * 모든 규칙을 기본값으로 초기화
       */
      resetToDefaults: () => {
        const { isDependencyCheckEnabled, isReviewerCheckEnabled } = DEFAULT_RULE_SETTINGS;
        
        set({ 
          isDependencyCheckEnabled,
          isReviewerCheckEnabled
        });
        
        // 초기화 알림
        console.log('🔄 규칙 설정이 기본값으로 초기화되었습니다');
      }
    }),
    {
      name: RULE_SETTINGS_STORAGE_KEY,
      
      // localStorage 저장/로드 시 추가 메타데이터 포함
      partialize: (state) => ({
        isDependencyCheckEnabled: state.isDependencyCheckEnabled,
        isReviewerCheckEnabled: state.isReviewerCheckEnabled,
        lastUpdated: new Date().toISOString(),
        version: DEFAULT_RULE_SETTINGS.version
      }),
      
      // 스토어 복원 시 버전 호환성 체크
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('❌ 규칙 설정 로드 실패:', error);
          return;
        }
        
        if (state) {
          console.log('✅ 규칙 설정 로드 완료:', {
            dependency: state.isDependencyCheckEnabled ? 'ON' : 'OFF',
            reviewer: state.isReviewerCheckEnabled ? 'ON' : 'OFF'
          });
        }
      }
    }
  )
);

/**
 * 규칙 설정 모달 상태 관리 스토어
 */
interface RuleSettingsModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useRuleSettingsModal = create<RuleSettingsModalState>((set) => ({
  isOpen: false,
  
  openModal: () => {
    set({ isOpen: true });
    console.log('🔧 규칙 설정 모달 열림');
  },
  
  closeModal: () => {
    set({ isOpen: false });
    console.log('🔧 규칙 설정 모달 닫힘');
  }
}));

// 편의용 셀렉터 훅들

/**
 * 의존성 검사 규칙 상태 및 토글 함수
 */
export const useDependencyRule = () => {
  const { isDependencyCheckEnabled, toggleDependencyCheck } = useRuleStore();
  
  return {
    enabled: isDependencyCheckEnabled,
    toggle: toggleDependencyCheck
  };
};

/**
 * 리뷰어 검사 규칙 상태 및 토글 함수
 */
export const useReviewerRule = () => {
  const { isReviewerCheckEnabled, toggleReviewerCheck } = useRuleStore();
  
  return {
    enabled: isReviewerCheckEnabled,
    toggle: toggleReviewerCheck
  };
};

/**
 * 모든 규칙 상태 (읽기 전용)
 */
export const useRuleStates = () => {
  const { isDependencyCheckEnabled, isReviewerCheckEnabled } = useRuleStore();
  
  return {
    dependency: isDependencyCheckEnabled,
    reviewer: isReviewerCheckEnabled,
    allEnabled: isDependencyCheckEnabled && isReviewerCheckEnabled,
    allDisabled: !isDependencyCheckEnabled && !isReviewerCheckEnabled
  };
};

/**
 * 규칙 설정 모달 제어
 */
export const useRuleModal = () => {
  const { isOpen, openModal, closeModal } = useRuleSettingsModal();
  
  return {
    isOpen,
    open: openModal,
    close: closeModal
  };
};

