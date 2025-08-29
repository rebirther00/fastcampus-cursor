'use client';

// FSTC-11 구현 결과 통합 테스트 페이지

import { useState } from 'react';
import { useDefaultBoardData } from '@/hooks/useBoardData';
import { useUIStore, useCardDetailModal, useCurrentUserRole } from '@/store/uiStore';
import { CreateCardSchema, UpdateCardSchema, CardSchema } from '@/types/workflow';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';

export default function IntegrationTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  
  // TanStack Query 커스텀 훅 테스트
  const { board, isLoading, error, refetch } = useDefaultBoardData();
  
  // Zustand UI 스토어 테스트
  const { isOpen, selectedCardId, open, close } = useCardDetailModal();
  const { role, setRole } = useCurrentUserRole();
  const { theme, setTheme } = useUIStore((state) => ({ 
    theme: state.theme, 
    setTheme: state.setTheme 
  }));

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `✅ ${result}`]);
  };

  const addErrorResult = (error: string) => {
    setTestResults(prev => [...prev, `❌ ${error}`]);
  };

  // Zod 스키마 유효성 검사 테스트
  const testZodSchemas = () => {
    try {
      // 유효한 카드 데이터 테스트
      const validCardData = {
        title: '테스트 카드',
        description: '테스트 설명입니다',
        assigneeId: 'user-1',
        priority: 'medium' as const,
        tags: ['test']
      };
      
      const createResult = CreateCardSchema.safeParse(validCardData);
      if (createResult.success) {
        addTestResult('CreateCardSchema 유효성 검사 통과');
      } else {
        addErrorResult(`CreateCardSchema 검사 실패: ${createResult.error.message}`);
      }

      // 무효한 데이터 테스트 (제목 없음)
      const invalidCardData = {
        description: '제목이 없는 카드',
        assigneeId: 'user-1',
        priority: 'medium' as const
      };
      
      const invalidResult = CreateCardSchema.safeParse(invalidCardData);
      if (!invalidResult.success) {
        addTestResult('CreateCardSchema 무효한 데이터 검증 성공');
      } else {
        addErrorResult('CreateCardSchema가 무효한 데이터를 통과시켰습니다');
      }

    } catch (error) {
      addErrorResult(`Zod 스키마 테스트 중 오류: ${error}`);
    }
  };

  // UI 스토어 테스트
  const testUIStore = () => {
    try {
      // 모달 상태 테스트
      open('test-card-1');
      if (isOpen && selectedCardId === 'test-card-1') {
        addTestResult('카드 모달 열기 성공');
      } else {
        addErrorResult('카드 모달 열기 실패');
      }

      close();
      if (!isOpen && selectedCardId === null) {
        addTestResult('카드 모달 닫기 성공');
      } else {
        addErrorResult('카드 모달 닫기 실패');
      }

      // 사용자 역할 변경 테스트
      const originalRole = role;
      const newRole = role === 'developer' ? 'product_owner' : 'developer';
      setRole(newRole);
      
      setTimeout(() => {
        const currentRole = useUIStore.getState().currentUserRole;
        if (currentRole === newRole) {
          addTestResult(`사용자 역할 변경 성공: ${newRole}`);
        } else {
          addErrorResult(`사용자 역할 변경 실패: ${currentRole} !== ${newRole}`);
        }
        setRole(originalRole); // 원래 상태로 복원
      }, 100);

    } catch (error) {
      addErrorResult(`UI 스토어 테스트 중 오류: ${error}`);
    }
  };

  // TanStack Query 테스트
  const testTanStackQuery = () => {
    try {
      if (isLoading) {
        addTestResult('TanStack Query 로딩 상태 확인됨');
      }
      
      if (error) {
        addErrorResult(`TanStack Query 에러: ${error}`);
      } else if (board) {
        addTestResult(`보드 데이터 로드 성공: ${board.title}`);
        addTestResult(`보드 컬럼 수: ${board.columns.length}`);
        
        const totalCards = board.columns.reduce((sum, col) => sum + col.cards.length, 0);
        addTestResult(`총 카드 수: ${totalCards}`);
      }
      
    } catch (error) {
      addErrorResult(`TanStack Query 테스트 중 오류: ${error}`);
    }
  };

  const runAllTests = () => {
    setTestResults([]);
    addTestResult('=== FSTC-11 통합 테스트 시작 ===');
    
    testZodSchemas();
    testUIStore();
    testTanStackQuery();
    
    setTimeout(() => {
      addTestResult('=== 모든 테스트 완료 ===');
    }, 500);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FSTC-11 구현 결과 검증
          </h1>
          <p className="text-gray-600">
            핵심 데이터 모델 및 상태 관리 설정 통합 테스트
          </p>
        </div>

        {/* 현재 상태 표시 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">TanStack Query</h3>
            <p className="text-sm text-blue-700">
              {isLoading ? '로딩 중...' : board ? `보드: ${board.title}` : '데이터 없음'}
            </p>
            <Badge variant={isLoading ? 'secondary' : board ? 'default' : 'destructive'}>
              {isLoading ? 'Loading' : board ? 'Success' : 'Error'}
            </Badge>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">UI Store</h3>
            <p className="text-sm text-green-700 mb-2">
              역할: {role} | 모달: {isOpen ? '열림' : '닫힘'}
            </p>
            <Badge variant="default">Connected</Badge>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Zod Schemas</h3>
            <p className="text-sm text-purple-700 mb-2">
              유효성 검사 스키마 준비됨
            </p>
            <Badge variant="default">Ready</Badge>
          </div>
        </div>

        {/* 테스트 실행 버튼들 */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={runAllTests} className="bg-blue-600 hover:bg-blue-700">
            전체 테스트 실행
          </Button>
          <Button onClick={testZodSchemas} variant="outline">
            Zod 스키마 테스트
          </Button>
          <Button onClick={testUIStore} variant="outline">
            UI 스토어 테스트
          </Button>
          <Button onClick={testTanStackQuery} variant="outline">
            TanStack Query 테스트
          </Button>
          <Button onClick={refetch} variant="outline">
            데이터 새로고침
          </Button>
        </div>

        {/* 사용자 역할 변경 테스트 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">사용자 역할 변경 테스트</h3>
          <div className="flex gap-2">
            <Button 
              onClick={() => setRole('developer')}
              variant={role === 'developer' ? 'default' : 'outline'}
              size="sm"
            >
              Developer
            </Button>
            <Button 
              onClick={() => setRole('product_owner')}
              variant={role === 'product_owner' ? 'default' : 'outline'}
              size="sm"
            >
              Product Owner
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            현재 역할: <strong>{role}</strong>
          </p>
        </div>

        {/* 카드 모달 테스트 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">카드 모달 테스트</h3>
          <div className="flex gap-2">
            <Button 
              onClick={() => open('test-card-123')}
              size="sm"
            >
              모달 열기
            </Button>
            <Button 
              onClick={close}
              variant="outline"
              size="sm"
            >
              모달 닫기
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            모달 상태: <strong>{isOpen ? '열림' : '닫힘'}</strong>
            {selectedCardId && ` | 선택된 카드: ${selectedCardId}`}
          </p>
        </div>

        {/* 테스트 결과 */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3">테스트 결과</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-sm">테스트를 실행하려면 위의 버튼을 클릭하세요.</p>
            ) : (
              testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`text-sm font-mono p-2 rounded ${
                    result.includes('❌') 
                      ? 'bg-red-50 text-red-700' 
                      : result.includes('===')
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'bg-green-50 text-green-700'
                  }`}
                >
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 보드 데이터 미리보기 */}
        {board && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-3">보드 데이터 미리보기</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {board.columns.slice(0, 6).map((column) => (
                <div key={column.id} className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: column.color }}
                    />
                    <h4 className="font-medium">{column.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {column.cards.length}개 카드
                  </p>
                  {column.cards.slice(0, 2).map((card) => (
                    <div key={card.id} className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <p className="font-medium">{card.title}</p>
                      <p className="text-gray-500">
                        {card.assignee.name} | {card.priority}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
