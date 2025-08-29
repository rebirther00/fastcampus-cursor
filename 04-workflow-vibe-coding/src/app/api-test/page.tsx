'use client';

// API 테스트 페이지

import { useState, useEffect } from 'react';
import { workflowAPI, handleAPIError } from '@/lib/api';
import { WorkflowBoard } from '@/types/workflow';

export default function APITestPage() {
  const [boards, setBoards] = useState<WorkflowBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<WorkflowBoard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 보드 조회 테스트
  const testGetBoards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowAPI.getBoards({ limit: 5 });
      if (response.success) {
        setBoards(response.data);
        console.log('✅ 보드 목록 조회 성공:', response);
      } else {
        setError(response.message || '보드 조회 실패');
      }
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      console.error('❌ 보드 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 특정 보드 상세 조회 테스트
  const testGetBoard = async (boardId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await workflowAPI.getBoard(boardId);
      if (response.success) {
        setSelectedBoard(response.data);
        console.log('✅ 보드 상세 조회 성공:', response);
      } else {
        setError(response.message || '보드 상세 조회 실패');
      }
    } catch (err) {
      const errorMessage = handleAPIError(err);
      setError(errorMessage);
      console.error('❌ 보드 상세 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 보드 목록 자동 로드
  useEffect(() => {
    testGetBoards();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🧪 워크플로우 보드 API 테스트
      </h1>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">API 호출 중...</p>
        </div>
      )}

      {/* API 테스트 버튼들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={testGetBoards}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          📋 보드 목록 조회 테스트
        </button>
        
        <button
          onClick={() => testGetBoard('board-1')}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          🔍 보드 상세 조회 테스트
        </button>
      </div>

      {/* 보드 목록 표시 */}
      {boards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">📋 보드 목록</h2>
          <div className="grid gap-4">
            {boards.map((board) => (
              <div key={board.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{board.title}</h3>
                    <p className="text-gray-600 mt-1">{board.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                      <span>📊 {board.columns.length}개 컬럼</span>
                      <span>👥 {board.members.length}명 멤버</span>
                      <span>🗓️ {new Date(board.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => testGetBoard(board.id)}
                    className="ml-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    상세보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 보드 상세 정보 */}
      {selectedBoard && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">🔍 보드 상세 정보</h2>
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-medium mb-4">{selectedBoard.title}</h3>
            <p className="text-gray-600 mb-4">{selectedBoard.description}</p>
            
            {/* 컬럼 정보 */}
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-3">📊 컬럼 구조</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedBoard.columns.map((column) => (
                  <div key={column.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      ></div>
                      <span className="font-medium">{column.title}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {column.cards.length}개 카드
                      {column.maxCards && ` (최대 ${column.maxCards}개)`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 멤버 정보 */}
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-3">👥 팀 멤버</h4>
              <div className="flex flex-wrap gap-2">
                {selectedBoard.members.map((member) => (
                  <div key={member.id} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {member.name} ({member.role === 'developer' ? '개발자' : 'PO'})
                  </div>
                ))}
              </div>
            </div>

            {/* 설정 정보 */}
            <div>
              <h4 className="text-lg font-medium mb-3">⚙️ 보드 설정</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">단계 건너뛰기:</span>
                  <span className={`ml-2 ${selectedBoard.settings.allowSkipStages ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBoard.settings.allowSkipStages ? '허용' : '금지'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">리뷰어 필수:</span>
                  <span className={`ml-2 ${selectedBoard.settings.requireReviewers ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBoard.settings.requireReviewers ? '필수' : '선택'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">최소 리뷰어 수:</span>
                  <span className="ml-2 text-blue-600">{selectedBoard.settings.minReviewers}명</span>
                </div>
                <div>
                  <span className="text-gray-600">WIP 제한:</span>
                  <span className={`ml-2 ${selectedBoard.settings.enforceWipLimits ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBoard.settings.enforceWipLimits ? '활성화' : '비활성화'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API 엔드포인트 정보 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🔗 API 엔드포인트</h2>
        <div className="space-y-2 text-sm font-mono">
          <div><span className="text-green-600">GET</span> /api/workflow/boards - 보드 목록 조회</div>
          <div><span className="text-green-600">GET</span> /api/workflow/boards/[id] - 보드 상세 조회</div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>💡 브라우저 개발자 도구의 Network 탭에서 실제 API 요청/응답을 확인할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
