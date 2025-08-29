/**
 * 규칙 엔진 단위 테스트
 * FSTC-13: 핵심 기능 및 비즈니스 로직 구현
 * 
 * 테스트 범위:
 * 1. 상태 전이 규칙 검증
 * 2. 역할 기반 권한 검증  
 * 3. 의존성 규칙 검증
 * 4. 리뷰어 규칙 검증
 * 5. WIP 제한 검증
 * 6. Edge Cases
 */

import { describe, it, expect } from '@jest/globals';
import { canMove, validateDependencies, validateReviewers } from '@/lib/rules';

import { 
  WorkflowCard, 
  CardStatus,
  WorkflowBoard,
  User,
  Dependency 
} from '@/types/workflow';

// Mock 데이터 설정
const mockDeveloper: User = {
  id: 'dev-1',
  name: '김개발',
  email: 'dev@test.com',
  role: 'developer'
};

// mockPO는 필요시 사용
// const mockPO: User = {
//   id: 'po-1', 
//   name: '최PO',
//   email: 'po@test.com',
//   role: 'product_owner'
// };

const mockReviewers: User[] = [
  { id: 'rev-1', name: '박리뷰1', email: 'rev1@test.com', role: 'developer' },
  { id: 'rev-2', name: '이리뷰2', email: 'rev2@test.com', role: 'developer' }
];

const mockDependencyDone: Dependency = {
  id: 'dep-1',
  title: '완료된 의존성',
  status: 'qa_done',
  required: true
};

const mockDependencyPending: Dependency = {
  id: 'dep-2', 
  title: '미완료 의존성',
  status: 'in_progress',
  required: true
};

const mockBoardSettings: WorkflowBoard['settings'] = {
  allowSkipStages: false,
  requireReviewers: true,
  minReviewers: 2,
  enforceWipLimits: true
};

const createMockCard = (overrides: Partial<WorkflowCard> = {}): WorkflowCard => ({
  id: 'card-1',
  title: '테스트 카드',
  description: '테스트용 카드입니다',
  status: 'backlog',
  priority: 'medium',
  assignee: mockDeveloper,
  reviewers: [],
  dependencies: [],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  tags: [],
  activityLogs: [],
  ...overrides
});

describe('규칙 엔진 - canMove 함수', () => {
  describe('✅ 정상적인 상태 전이', () => {
    it('백로그 → 개발 중 이동 허용', () => {
      const card = createMockCard({ status: 'backlog' });
      
      const result = canMove(card, 'backlog', 'in_progress', 'developer', mockBoardSettings);
      
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('개발 중 → QA 요청 이동 허용 (리뷰어 충족 시)', () => {
      const card = createMockCard({ 
        status: 'in_progress',
        reviewers: mockReviewers
      });
      
      const result = canMove(card, 'in_progress', 'ready_for_qa', 'developer', mockBoardSettings);
      
      expect(result.allowed).toBe(true);
    });

    it('QA 요청 → QA 완료 이동 허용', () => {
      const card = createMockCard({ status: 'ready_for_qa' });
      
      const result = canMove(card, 'ready_for_qa', 'qa_done', 'developer', mockBoardSettings);
      
      expect(result.allowed).toBe(true);
    });

    it('배포 승인 → 배포 완료 이동 허용 (PO 역할)', () => {
      const card = createMockCard({ status: 'ready_for_deploy' });
      
      const result = canMove(card, 'ready_for_deploy', 'done', 'product_owner', mockBoardSettings);
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('❌ 잘못된 상태 전이', () => {
    it('백로그 → QA 요청 직접 이동 거부 (단계 건너뛰기)', () => {
      const card = createMockCard({ status: 'backlog' });
      
      const result = canMove(card, 'backlog', 'ready_for_qa', 'developer', mockBoardSettings);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('단계를 건너뛸 수 없습니다');
    });

    it('개발 중 → 배포 완료 직접 이동 거부 (여러 단계 건너뛰기)', () => {
      const card = createMockCard({ status: 'in_progress' });
      
      const result = canMove(card, 'in_progress', 'done', 'developer', mockBoardSettings);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('단계를 건너뛸 수 없습니다');
    });

    it('배포 완료 → 다른 상태 이동 거부 (완료 상태는 최종)', () => {
      const card = createMockCard({ status: 'done' });
      
      const result = canMove(card, 'done', 'ready_for_deploy', 'product_owner', mockBoardSettings);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('완료된 카드는 이동할 수 없습니다');
    });
  });

  describe('🔒 역할 기반 권한 검증', () => {
    it('개발자가 배포 승인 → 배포 완료 이동 시도 시 거부', () => {
      const card = createMockCard({ status: 'ready_for_deploy' });
      
      const result = canMove(card, 'ready_for_deploy', 'done', 'developer', mockBoardSettings);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('권한이 없습니다');
      expect(result.reason).toContain('프로덕트 오너만');
    });

    it('PO가 모든 상태 전이 가능', () => {
      const testCases: Array<{ from: CardStatus; to: CardStatus }> = [
        { from: 'backlog', to: 'in_progress' },
        { from: 'in_progress', to: 'ready_for_qa' },
        { from: 'ready_for_qa', to: 'qa_done' },
        { from: 'qa_done', to: 'ready_for_deploy' },
        { from: 'ready_for_deploy', to: 'done' }
      ];

      testCases.forEach(({ from, to }) => {
        const card = createMockCard({ 
          status: from,
          reviewers: mockReviewers // 리뷰어 요구사항 충족
        });
        
        const result = canMove(card, from, to, 'product_owner', mockBoardSettings);
        
        expect(result.allowed).toBe(true);
      });
    });
  });

  describe('🔗 의존성 규칙 검증', () => {
    it('의존성이 완료되지 않은 경우 QA 요청 이동 거부', () => {
      const card = createMockCard({
        status: 'in_progress',
        dependencies: [mockDependencyPending],
        reviewers: mockReviewers
      });
      
      const result = canMove(card, 'in_progress', 'ready_for_qa', 'developer', mockBoardSettings);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('의존성이 완료되지 않았습니다');
      expect(result.reason).toContain('미완료 의존성');
    });

    it('의존성이 완료된 경우 QA 요청 이동 허용', () => {
      const card = createMockCard({
        status: 'in_progress',
        dependencies: [mockDependencyDone],
        reviewers: mockReviewers
      });
      
      const result = canMove(card, 'in_progress', 'ready_for_qa', 'developer', mockBoardSettings);
      
      expect(result.allowed).toBe(true);
    });

    it('선택적 의존성은 미완료여도 이동 허용', () => {
      const optionalDependency: Dependency = {
        ...mockDependencyPending,
        required: false
      };
      
      const card = createMockCard({
        status: 'in_progress',
        dependencies: [optionalDependency],
        reviewers: mockReviewers
      });
      
      const result = canMove(card, 'in_progress', 'ready_for_qa', 'developer', mockBoardSettings);
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('👥 리뷰어 규칙 검증', () => {
    it('리뷰어가 부족한 경우 QA 요청 이동 거부', () => {
      const card = createMockCard({
        status: 'in_progress',
        reviewers: [mockReviewers[0]] // 1명만 지정 (최소 2명 필요)
      });
      
      const result = canMove(card, 'in_progress', 'ready_for_qa', 'developer', mockBoardSettings);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('리뷰어가 부족합니다');
      expect(result.reason).toContain('최소 2명');
    });

    it('리뷰어 요구사항이 비활성화된 경우 이동 허용', () => {
      const settingsWithoutReviewers = {
        ...mockBoardSettings,
        requireReviewers: false
      };
      
      const card = createMockCard({
        status: 'in_progress',
        reviewers: [] // 리뷰어 없음
      });
      
      const result = canMove(card, 'in_progress', 'ready_for_qa', 'developer', settingsWithoutReviewers);
      
      expect(result.allowed).toBe(true);
    });
  });
});

describe('의존성 검증 함수', () => {
  it('모든 필수 의존성이 완료된 경우 true 반환', () => {
    const dependencies = [mockDependencyDone];
    
    const result = validateDependencies(dependencies);
    
    expect(result.isValid).toBe(true);
    expect(result.pendingDependencies).toHaveLength(0);
  });

  it('미완료 필수 의존성이 있는 경우 false 반환', () => {
    const dependencies = [mockDependencyDone, mockDependencyPending];
    
    const result = validateDependencies(dependencies);
    
    expect(result.isValid).toBe(false);
    expect(result.pendingDependencies).toHaveLength(1);
    expect(result.pendingDependencies[0].title).toBe('미완료 의존성');
  });

  it('빈 의존성 배열의 경우 true 반환', () => {
    const result = validateDependencies([]);
    
    expect(result.isValid).toBe(true);
    expect(result.pendingDependencies).toHaveLength(0);
  });
});

describe('리뷰어 검증 함수', () => {
  it('충분한 리뷰어가 있는 경우 true 반환', () => {
    const result = validateReviewers(mockReviewers, mockBoardSettings);
    
    expect(result.isValid).toBe(true);
    expect(result.currentCount).toBe(2);
    expect(result.requiredCount).toBe(2);
  });

  it('리뷰어가 부족한 경우 false 반환', () => {
    const result = validateReviewers([mockReviewers[0]], mockBoardSettings);
    
    expect(result.isValid).toBe(false);
    expect(result.currentCount).toBe(1);
    expect(result.requiredCount).toBe(2);
  });

  it('리뷰어 요구사항이 비활성화된 경우 true 반환', () => {
    const settings = { ...mockBoardSettings, requireReviewers: false };
    
    const result = validateReviewers([], settings);
    
    expect(result.isValid).toBe(true);
  });
});

describe('🚨 Edge Cases', () => {
  it('null/undefined 카드 처리', () => {
    expect(() => {
      canMove(null as unknown as WorkflowCard, 'backlog', 'in_progress', 'developer', mockBoardSettings);
    }).toThrow('카드 정보가 필요합니다');
  });

  it('잘못된 상태값 처리', () => {
    const card = createMockCard();
    
    const result = canMove(card, 'invalid_status' as CardStatus, 'in_progress', 'developer', mockBoardSettings);
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('잘못된 상태입니다');
  });

  it('잘못된 역할값 처리', () => {
    const card = createMockCard();
    
    const result = canMove(card, 'backlog', 'in_progress', 'invalid_role' as 'developer', mockBoardSettings);
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('잘못된 역할입니다');
  });

  it('동일한 상태로의 이동 처리', () => {
    const card = createMockCard({ status: 'in_progress' });
    
    const result = canMove(card, 'in_progress', 'in_progress', 'developer', mockBoardSettings);
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('동일한 상태로는 이동할 수 없습니다');
  });

  it('빈 보드 설정 처리', () => {
    const card = createMockCard();
    
    const result = canMove(card, 'backlog', 'in_progress', 'developer', {} as WorkflowBoard['settings']);
    
    expect(result.allowed).toBe(true); // 기본 규칙으로 동작
  });

  it('순환 의존성 감지', () => {
    const circularDep: Dependency = {
      id: 'card-1', // 자기 자신을 의존성으로 설정
      title: '순환 의존성',
      status: 'in_progress',
      required: true
    };
    
    const card = createMockCard({
      id: 'card-1',
      dependencies: [circularDep]
    });
    
    const result = validateDependencies(card.dependencies, card.id);
    
    expect(result.isValid).toBe(false);
    expect(result.circularDependencies).toContain('card-1');
  });
});
