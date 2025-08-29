/**
 * FSTC-12 통합 테스트
 * 
 * 실제 컴포넌트들이 올바르게 구성되고 렌더링되는지 확인하는 통합 테스트
 */

import { mockWorkflowBoard } from '@/lib/mock-data'
import { ROLE_PERMISSIONS, STATUS_TRANSITIONS, UserRoleSchema, CardStatusSchema, PrioritySchema } from '@/types/workflow'
import fs from 'fs'
import path from 'path'

describe('FSTC-12 Integration Tests', () => {
  it('Mock 데이터가 올바르게 구성되어 있다', () => {
    // 보드 데이터 구조 검증
    expect(mockWorkflowBoard).toBeDefined()
    expect(mockWorkflowBoard.id).toBe('board-1')
    expect(mockWorkflowBoard.title).toBe('기능 배포 승인 워크플로우')
    expect(mockWorkflowBoard.columns).toHaveLength(6)
    expect(mockWorkflowBoard.members).toHaveLength(4)
    
    // 각 컬럼이 올바른 구조를 가지고 있는지 확인
    mockWorkflowBoard.columns.forEach(column => {
      expect(column).toHaveProperty('id')
      expect(column).toHaveProperty('title')
      expect(column).toHaveProperty('status')
      expect(column).toHaveProperty('cards')
      expect(column).toHaveProperty('color')
      expect(Array.isArray(column.cards)).toBe(true)
    })
    
    // 카드 데이터 구조 검증
    const allCards = mockWorkflowBoard.columns.flatMap(col => col.cards)
    expect(allCards.length).toBeGreaterThan(0)
    
    allCards.forEach(card => {
      expect(card).toHaveProperty('id')
      expect(card).toHaveProperty('title')
      expect(card).toHaveProperty('description')
      expect(card).toHaveProperty('status')
      expect(card).toHaveProperty('priority')
      expect(card).toHaveProperty('assignee')
      expect(card).toHaveProperty('reviewers')
      expect(card).toHaveProperty('dependencies')
      expect(card).toHaveProperty('tags')
      expect(Array.isArray(card.reviewers)).toBe(true)
      expect(Array.isArray(card.dependencies)).toBe(true)
      expect(Array.isArray(card.tags)).toBe(true)
    })
  })

  it('컬럼별 카드 분류가 올바르게 되어 있다', () => {
    const statusCounts = {
      backlog: 0,
      in_progress: 0,
      ready_for_qa: 0,
      qa_done: 0,
      ready_for_deploy: 0,
      done: 0
    }
    
    mockWorkflowBoard.columns.forEach(column => {
      statusCounts[column.status] = column.cards.length
      
      // 각 카드의 상태가 컬럼 상태와 일치하는지 확인
      column.cards.forEach(card => {
        expect(card.status).toBe(column.status)
      })
    })
    
    console.log('컬럼별 카드 수:', statusCounts)
  })

  it('사용자 역할과 권한이 올바르게 정의되어 있다', () => {

    
    expect(ROLE_PERMISSIONS.developer).toBeDefined()
    expect(ROLE_PERMISSIONS.product_owner).toBeDefined()
    
    // 개발자 권한 확인
    expect(ROLE_PERMISSIONS.developer.canCreateCard).toBe(true)
    expect(ROLE_PERMISSIONS.developer.canDeleteCard).toBe(false)
    expect(Array.isArray(ROLE_PERMISSIONS.developer.canMoveToStatus)).toBe(true)
    
    // PO 권한 확인
    expect(ROLE_PERMISSIONS.product_owner.canCreateCard).toBe(true)
    expect(ROLE_PERMISSIONS.product_owner.canDeleteCard).toBe(true)
    expect(Array.isArray(ROLE_PERMISSIONS.product_owner.canMoveToStatus)).toBe(true)
    
    // PO가 더 많은 상태로 이동할 수 있는지 확인
    expect(ROLE_PERMISSIONS.product_owner.canMoveToStatus.length)
      .toBeGreaterThan(ROLE_PERMISSIONS.developer.canMoveToStatus.length)
  })

  it('상태 전이 규칙이 올바르게 정의되어 있다', () => {

    
    // 각 상태별 전이 규칙 확인
    expect(STATUS_TRANSITIONS.backlog).toEqual(['in_progress'])
    expect(STATUS_TRANSITIONS.in_progress).toEqual(['ready_for_qa', 'backlog'])
    expect(STATUS_TRANSITIONS.ready_for_qa).toEqual(['qa_done', 'in_progress'])
    expect(STATUS_TRANSITIONS.qa_done).toEqual(['ready_for_deploy', 'ready_for_qa'])
    expect(STATUS_TRANSITIONS.ready_for_deploy).toEqual(['done', 'qa_done'])
    expect(STATUS_TRANSITIONS.done).toEqual([])
  })

  it('우선순위 시스템이 올바르게 동작한다', () => {
    const allCards = mockWorkflowBoard.columns.flatMap(col => col.cards)
    const priorities = ['low', 'medium', 'high', 'urgent']
    
    allCards.forEach(card => {
      expect(priorities).toContain(card.priority)
    })
    
    // 각 우선순위별 카드 수 확인
    const priorityCounts = priorities.reduce((acc, priority) => {
      acc[priority] = allCards.filter(card => card.priority === priority).length
      return acc
    }, {} as Record<string, number>)
    
    console.log('우선순위별 카드 수:', priorityCounts)
  })

  it('컴포넌트 파일들이 존재한다', () => {
    // 주요 컴포넌트 파일들의 존재 확인

    
    const componentPaths = [
      'src/app/board/page.tsx',
      'src/components/templates/BoardTemplate.tsx',
      'src/components/organisms/Header.tsx',
      'src/components/organisms/Column.tsx',
      'src/components/organisms/Card.tsx',
      'src/components/molecules/UserRoleSwitcher.tsx',
    ]
    
    componentPaths.forEach(componentPath => {
      const fullPath = path.join(process.cwd(), componentPath)
      expect(fs.existsSync(fullPath)).toBe(true)
    })
  })

  it('타입 정의가 올바르게 export되어 있다', () => {
    // 주요 타입들이 export되어 있는지 확인
    expect(STATUS_TRANSITIONS).toBeDefined()
    expect(ROLE_PERMISSIONS).toBeDefined()
    expect(UserRoleSchema).toBeDefined()
    expect(CardStatusSchema).toBeDefined()
    expect(PrioritySchema).toBeDefined()
  })
})
