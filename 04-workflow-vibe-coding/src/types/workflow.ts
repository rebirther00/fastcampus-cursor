// 워크플로우 보드 관련 타입 정의

import { z } from 'zod';

// 사용자 역할
export type UserRole = 'developer' | 'product_owner';

// 카드 상태 (컬럼)
export type CardStatus = 
  | 'backlog'           // 백로그
  | 'in_progress'       // 개발 중
  | 'ready_for_qa'      // QA 요청
  | 'qa_done'           // QA 완료
  | 'ready_for_deploy'  // 배포 승인
  | 'done';             // 배포 완료

// 우선순위
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// 사용자 정보
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// 의존성 정보
export interface Dependency {
  id: string;
  title: string;
  status: CardStatus;
  required: boolean; // 필수 의존성 여부
}

// 활동 이력
export interface ActivityLog {
  id: string;
  cardId: string;
  userId: string;
  userName: string;
  action: 'created' | 'moved' | 'updated' | 'approved' | 'assigned';
  fromStatus?: CardStatus;
  toStatus?: CardStatus;
  timestamp: string;
  description?: string;
}

// 워크플로우 카드 (티켓)
export interface WorkflowCard {
  id: string;
  title: string;
  description: string;
  status: CardStatus;
  priority: Priority;
  assignee: User;
  reviewers: User[];
  dependencies: Dependency[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  estimatedHours?: number;
  tags: string[];
  activityLogs: ActivityLog[];
}

// 워크플로우 컬럼
export interface WorkflowColumn {
  id: string;
  title: string;
  status: CardStatus;
  cards: WorkflowCard[];
  maxCards?: number; // WIP 제한
  color: string;
}

// 워크플로우 보드
export interface WorkflowBoard {
  id: string;
  title: string;
  description: string;
  columns: WorkflowColumn[];
  members: User[];
  createdAt: string;
  updatedAt: string;
  settings: {
    allowSkipStages: boolean;
    requireReviewers: boolean;
    minReviewers: number;
    enforceWipLimits: boolean;
  };
}

// API 응답 타입
export interface WorkflowBoardResponse {
  success: boolean;
  data: WorkflowBoard;
  message?: string;
}

export interface WorkflowBoardsResponse {
  success: boolean;
  data: WorkflowBoard[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}

// API 요청 타입
export interface CreateCardRequest {
  title: string;
  description: string;
  assigneeId: string;
  priority: Priority;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  status?: CardStatus;
  assigneeId?: string;
  reviewerIds?: string[];
  priority?: Priority;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  dependencyIds?: string[];
}

// 상태 전이 규칙
export const STATUS_TRANSITIONS: Record<CardStatus, CardStatus[]> = {
  backlog: ['in_progress'],
  in_progress: ['ready_for_qa', 'backlog'],
  ready_for_qa: ['qa_done', 'in_progress'],
  qa_done: ['ready_for_deploy', 'ready_for_qa'],
  ready_for_deploy: ['done', 'qa_done'],
  done: []
};

// 역할별 권한
export const ROLE_PERMISSIONS: Record<UserRole, {
  canMoveToStatus: CardStatus[];
  canCreateCard: boolean;
  canDeleteCard: boolean;
  canAssignReviewers: boolean;
}> = {
  developer: {
    canMoveToStatus: ['backlog', 'in_progress', 'ready_for_qa', 'qa_done'],
    canCreateCard: true,
    canDeleteCard: false,
    canAssignReviewers: true
  },
  product_owner: {
    canMoveToStatus: ['backlog', 'in_progress', 'ready_for_qa', 'qa_done', 'ready_for_deploy', 'done'],
    canCreateCard: true,
    canDeleteCard: true,
    canAssignReviewers: true
  }
};

// Zod 유효성 검사 스키마
export const UserRoleSchema = z.enum(['developer', 'product_owner']);

export const CardStatusSchema = z.enum([
  'backlog',
  'in_progress', 
  'ready_for_qa',
  'qa_done',
  'ready_for_deploy',
  'done'
]);

export const PrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const UserSchema = z.object({
  id: z.string().min(1, '사용자 ID는 필수입니다'),
  name: z.string().min(1, '사용자 이름은 필수입니다'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  role: UserRoleSchema,
  avatar: z.string().optional()
});

export const DependencySchema = z.object({
  id: z.string().min(1, '의존성 ID는 필수입니다'),
  title: z.string().min(1, '의존성 제목은 필수입니다'),
  status: CardStatusSchema,
  required: z.boolean()
});

export const ActivityLogSchema = z.object({
  id: z.string().min(1, '활동 로그 ID는 필수입니다'),
  cardId: z.string().min(1, '카드 ID는 필수입니다'),
  userId: z.string().min(1, '사용자 ID는 필수입니다'),
  userName: z.string().min(1, '사용자 이름은 필수입니다'),
  action: z.enum(['created', 'moved', 'updated', 'approved', 'assigned']),
  fromStatus: CardStatusSchema.optional(),
  toStatus: CardStatusSchema.optional(),
  timestamp: z.string().datetime('올바른 날짜 형식이 아닙니다'),
  description: z.string().optional()
});

// 핵심 카드 스키마 (폼 유효성 검사용)
export const CardSchema = z.object({
  id: z.string().min(1, '카드 ID는 필수입니다'),
  title: z.string().min(1, '제목은 필수입니다').max(100, '제목은 100자 이하여야 합니다'),
  description: z.string().min(1, '설명은 필수입니다'),
  status: CardStatusSchema,
  priority: PrioritySchema,
  assignee: UserSchema,
  reviewers: z.array(UserSchema),
  dependencies: z.array(DependencySchema),
  createdAt: z.string().datetime('올바른 생성일 형식이 아닙니다'),
  updatedAt: z.string().datetime('올바른 수정일 형식이 아닙니다'),
  dueDate: z.string().datetime('올바른 마감일 형식이 아닙니다').optional(),
  estimatedHours: z.number().min(0, '예상 시간은 0 이상이어야 합니다').optional(),
  tags: z.array(z.string()),
  activityLogs: z.array(ActivityLogSchema)
});

// 카드 생성/수정용 스키마 (간소화된 버전)
export const CreateCardSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').max(100, '제목은 100자 이하여야 합니다'),
  description: z.string().min(1, '설명은 필수입니다'),
  assigneeId: z.string().min(1, '담당자는 필수입니다'),
  priority: PrioritySchema,
  dueDate: z.string().optional().refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val),
    { message: '올바른 날짜 형식이 아닙니다 (YYYY-MM-DDTHH:mm)' }
  ),
  estimatedHours: z.union([
    z.number().min(0, '예상 시간은 0 이상이어야 합니다'),
    z.string().transform((val, ctx) => {
      if (val === '' || val === undefined) return undefined;
      const parsed = parseFloat(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '올바른 숫자 형식이 아닙니다',
        });
        return z.NEVER;
      }
      if (parsed < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '예상 시간은 0 이상이어야 합니다',
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]).optional(),
  tags: z.array(z.string()).default([])
});

export const UpdateCardSchema = CreateCardSchema.partial().extend({
  id: z.string().min(1, '카드 ID는 필수입니다'),
  status: CardStatusSchema.optional(),
  reviewerIds: z.array(z.string()).optional(),
  dependencyIds: z.array(z.string()).optional()
});

// 타입 추출 (Zod 스키마에서 TypeScript 타입 생성)
export type CreateCardInput = z.infer<typeof CreateCardSchema>;
export type UpdateCardInput = z.infer<typeof UpdateCardSchema>;
