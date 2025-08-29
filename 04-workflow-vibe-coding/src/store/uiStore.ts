// UI 상태 관리 스토어 (Zustand)

import { create } from 'zustand';
import { UserRole } from '@/types/workflow';

interface UIState {
  // 모달 상태
  isCardDetailModalOpen: boolean;
  selectedCardId: string | null;
  
  // 사용자 역할
  currentUserRole: UserRole;
  
  // 기타 UI 상태
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // 액션들
  openCardDetailModal: (cardId: string) => void;
  closeCardDetailModal: () => void;
  setCurrentUserRole: (role: UserRole) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>((set) => ({
  // 초기 상태
  isCardDetailModalOpen: false,
  selectedCardId: null,
  currentUserRole: 'developer', // 기본값
  sidebarCollapsed: false,
  theme: 'system',
  
  // 카드 상세 모달 액션
  openCardDetailModal: (cardId: string) => 
    set({ 
      isCardDetailModalOpen: true, 
      selectedCardId: cardId 
    }),
  
  closeCardDetailModal: () => 
    set({ 
      isCardDetailModalOpen: false, 
      selectedCardId: null 
    }),
  
  // 사용자 역할 설정
  setCurrentUserRole: (role: UserRole) => 
    set({ currentUserRole: role }),
  
  // 사이드바 토글
  toggleSidebar: () => 
    set((state) => ({ 
      sidebarCollapsed: !state.sidebarCollapsed 
    })),
  
  setSidebarCollapsed: (collapsed: boolean) => 
    set({ sidebarCollapsed: collapsed }),
  
  // 테마 설정
  setTheme: (theme: 'light' | 'dark' | 'system') => 
    set({ theme })
}));

// 편의용 셀렉터 훅들
export const useCardDetailModal = () => {
  const { 
    isCardDetailModalOpen, 
    selectedCardId, 
    openCardDetailModal, 
    closeCardDetailModal 
  } = useUIStore();
  
  return {
    isOpen: isCardDetailModalOpen,
    selectedCardId,
    open: openCardDetailModal,
    close: closeCardDetailModal
  };
};

export const useCurrentUserRole = () => {
  const { currentUserRole, setCurrentUserRole } = useUIStore();
  
  return {
    role: currentUserRole,
    setRole: setCurrentUserRole
  };
};

export const useSidebar = () => {
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    setSidebarCollapsed 
  } = useUIStore();
  
  return {
    collapsed: sidebarCollapsed,
    toggle: toggleSidebar,
    setCollapsed: setSidebarCollapsed
  };
};

export const useTheme = () => {
  const { theme, setTheme } = useUIStore();
  
  return {
    theme,
    setTheme
  };
};
