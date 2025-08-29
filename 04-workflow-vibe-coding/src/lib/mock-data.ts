// 워크플로우 보드 Mock 데이터

import { 
  WorkflowBoard, 
  WorkflowCard, 
  WorkflowColumn, 
  User, 
  ActivityLog,
  Dependency,
  CardStatus 
} from '@/types/workflow';

// Mock 사용자 데이터
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: '김개발',
    email: 'kim.dev@company.com',
    role: 'developer',
    avatar: '/avatars/kim.jpg'
  },
  {
    id: 'user-2', 
    name: '박프론트',
    email: 'park.frontend@company.com',
    role: 'developer',
    avatar: '/avatars/park.jpg'
  },
  {
    id: 'user-3',
    name: '이백엔드',
    email: 'lee.backend@company.com', 
    role: 'developer',
    avatar: '/avatars/lee.jpg'
  },
  {
    id: 'user-4',
    name: '최PO',
    email: 'choi.po@company.com',
    role: 'product_owner',
    avatar: '/avatars/choi.jpg'
  }
];

// Mock 의존성 데이터
export const mockDependencies: Dependency[] = [
  {
    id: 'dep-1',
    title: 'API 인증 시스템 구축',
    status: 'done',
    required: true
  },
  {
    id: 'dep-2', 
    title: '데이터베이스 스키마 설계',
    status: 'qa_done',
    required: true
  },
  {
    id: 'dep-3',
    title: 'UI 컴포넌트 라이브러리',
    status: 'in_progress',
    required: false
  }
];

// Mock 활동 로그
export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-1',
    cardId: 'card-1',
    userId: 'user-1',
    userName: '김개발',
    action: 'created',
    timestamp: '2025-01-14T09:00:00Z',
    description: '카드를 생성했습니다.'
  },
  {
    id: 'log-2',
    cardId: 'card-1', 
    userId: 'user-1',
    userName: '김개발',
    action: 'moved',
    fromStatus: 'backlog',
    toStatus: 'in_progress',
    timestamp: '2025-01-14T10:30:00Z',
    description: '백로그에서 개발 중으로 이동했습니다.'
  },
  {
    id: 'log-3',
    cardId: 'card-2',
    userId: 'user-2',
    userName: '박프론트',
    action: 'assigned',
    timestamp: '2025-01-14T11:15:00Z',
    description: '리뷰어로 지정되었습니다.'
  }
];

// Mock 워크플로우 카드들
export const mockCards: WorkflowCard[] = [
  {
    id: 'card-1',
    title: '사용자 로그인 기능 구현',
    description: '이메일/패스워드 기반 로그인 시스템을 구현합니다. JWT 토큰을 사용하여 인증을 처리하고, 로그인 상태를 유지합니다.',
    status: 'in_progress',
    priority: 'high',
    assignee: mockUsers[0], // 김개발
    reviewers: [mockUsers[1], mockUsers[2]], // 박프론트, 이백엔드
    dependencies: [mockDependencies[0]], // API 인증 시스템
    createdAt: '2025-01-14T09:00:00Z',
    updatedAt: '2025-01-14T10:30:00Z',
    dueDate: '2025-01-20T23:59:59Z',
    estimatedHours: 16,
    tags: ['authentication', 'security', 'frontend'],
    activityLogs: [mockActivityLogs[0], mockActivityLogs[1]]
  },
  {
    id: 'card-2',
    title: '대시보드 UI 개발',
    description: '관리자용 대시보드 페이지를 개발합니다. 차트, 통계, 사용자 관리 기능을 포함합니다.',
    status: 'ready_for_qa',
    priority: 'medium',
    assignee: mockUsers[1], // 박프론트
    reviewers: [mockUsers[0], mockUsers[3]], // 김개발, 최PO
    dependencies: [mockDependencies[2]], // UI 컴포넌트 라이브러리
    createdAt: '2025-01-13T14:00:00Z',
    updatedAt: '2025-01-14T16:45:00Z',
    dueDate: '2025-01-22T23:59:59Z',
    estimatedHours: 24,
    tags: ['dashboard', 'ui', 'charts'],
    activityLogs: [mockActivityLogs[2]]
  },
  {
    id: 'card-3',
    title: '데이터 백업 시스템',
    description: '자동 데이터 백업 및 복구 시스템을 구현합니다. 일일/주간 백업 스케줄링을 포함합니다.',
    status: 'qa_done',
    priority: 'high',
    assignee: mockUsers[2], // 이백엔드
    reviewers: [mockUsers[0]], // 김개발
    dependencies: [mockDependencies[1]], // 데이터베이스 스키마
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2025-01-14T14:20:00Z',
    dueDate: '2025-01-18T23:59:59Z',
    estimatedHours: 20,
    tags: ['backup', 'database', 'automation'],
    activityLogs: []
  },
  {
    id: 'card-4',
    title: '모바일 앱 알림 기능',
    description: '푸시 알림 시스템을 구현합니다. FCM을 사용하여 실시간 알림을 전송합니다.',
    status: 'in_progress',
    priority: 'low',
    assignee: mockUsers[1], // 박프론트
    reviewers: [mockUsers[0], mockUsers[2]], // 김개발, 이백엔드 (2명으로 리뷰어 요구사항 충족)
    dependencies: [], // 의존성 없음
    createdAt: '2025-01-14T08:30:00Z',
    updatedAt: '2025-01-14T08:30:00Z',
    dueDate: '2025-01-25T23:59:59Z',
    estimatedHours: 12,
    tags: ['mobile', 'notification', 'fcm'],
    activityLogs: []
  },
  {
    id: 'card-5',
    title: '결제 시스템 통합',
    description: '외부 결제 API와 연동하여 결제 처리 시스템을 구현합니다. 결제 내역 관리 및 환불 기능을 포함합니다.',
    status: 'ready_for_deploy',
    priority: 'urgent',
    assignee: mockUsers[2], // 이백엔드
    reviewers: [mockUsers[0], mockUsers[1], mockUsers[3]], // 모든 팀원
    dependencies: [mockDependencies[0], mockDependencies[1]], // 인증 + DB
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-14T17:00:00Z',
    dueDate: '2025-01-16T23:59:59Z',
    estimatedHours: 32,
    tags: ['payment', 'api', 'security'],
    activityLogs: []
  },
  {
    id: 'card-6',
    title: '사용자 프로필 페이지',
    description: '사용자가 자신의 프로필을 수정할 수 있는 페이지를 구현합니다. 아바타 업로드, 개인정보 수정 기능을 포함합니다.',
    status: 'done',
    priority: 'medium',
    assignee: mockUsers[1], // 박프론트
    reviewers: [mockUsers[0]], // 김개발
    dependencies: [mockDependencies[0]], // API 인증 시스템
    createdAt: '2025-01-08T11:00:00Z',
    updatedAt: '2025-01-13T15:30:00Z',
    dueDate: '2025-01-15T23:59:59Z',
    estimatedHours: 18,
    tags: ['profile', 'ui', 'upload'],
    activityLogs: []
  }
];

// 상태별로 카드를 분류하는 헬퍼 함수
export const getCardsByStatus = (status: CardStatus): WorkflowCard[] => {
  return mockCards.filter(card => card.status === status);
};

// Mock 워크플로우 컬럼들
export const mockColumns: WorkflowColumn[] = [
  {
    id: 'col-1',
    title: '백로그',
    status: 'backlog',
    cards: getCardsByStatus('backlog'),
    color: '#6B7280' // gray-500
  },
  {
    id: 'col-2',
    title: '개발 중',
    status: 'in_progress', 
    cards: getCardsByStatus('in_progress'),
    maxCards: 3, // WIP 제한
    color: '#3B82F6' // blue-500
  },
  {
    id: 'col-3',
    title: 'QA 요청',
    status: 'ready_for_qa',
    cards: getCardsByStatus('ready_for_qa'),
    maxCards: 2,
    color: '#F59E0B' // amber-500
  },
  {
    id: 'col-4',
    title: 'QA 완료',
    status: 'qa_done',
    cards: getCardsByStatus('qa_done'),
    color: '#8B5CF6' // violet-500
  },
  {
    id: 'col-5',
    title: '배포 승인',
    status: 'ready_for_deploy',
    cards: getCardsByStatus('ready_for_deploy'),
    color: '#EF4444' // red-500
  },
  {
    id: 'col-6',
    title: '배포 완료',
    status: 'done',
    cards: getCardsByStatus('done'),
    color: '#10B981' // emerald-500
  }
];

// Mock 워크플로우 보드
export const mockWorkflowBoard: WorkflowBoard = {
  id: 'board-1',
  title: '기능 배포 승인 워크플로우',
  description: '개발팀의 신규 기능 개발부터 배포까지의 전 과정을 관리하는 워크플로우 보드입니다.',
  columns: mockColumns,
  members: mockUsers,
  createdAt: '2025-01-10T00:00:00Z',
  updatedAt: '2025-01-14T17:00:00Z',
  settings: {
    allowSkipStages: false,
    requireReviewers: true,
    minReviewers: 2,
    enforceWipLimits: true
  }
};

// 여러 보드를 위한 Mock 데이터 (확장용)
export const mockWorkflowBoards: WorkflowBoard[] = [
  mockWorkflowBoard,
  {
    ...mockWorkflowBoard,
    id: 'board-2',
    title: '버그 수정 워크플로우',
    description: '버그 리포트부터 수정 완료까지의 프로세스를 관리합니다.',
    settings: {
      allowSkipStages: true,
      requireReviewers: true,
      minReviewers: 1,
      enforceWipLimits: false
    }
  }
];
