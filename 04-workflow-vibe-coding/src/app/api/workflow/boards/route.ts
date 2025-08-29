// 워크플로우 보드 목록 조회 API

import { NextRequest, NextResponse } from 'next/server';
import { mockWorkflowBoards } from '@/lib/mock-data';
import { WorkflowBoardsResponse } from '@/types/workflow';

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // 검색 필터링
    let filteredBoards = mockWorkflowBoards;
    if (search) {
      filteredBoards = mockWorkflowBoards.filter(board => 
        board.title.toLowerCase().includes(search.toLowerCase()) ||
        board.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 페이지네이션 계산
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBoards = filteredBoards.slice(startIndex, endIndex);

    // 응답 데이터 구성
    const response: WorkflowBoardsResponse = {
      success: true,
      data: paginatedBoards,
      total: filteredBoards.length,
      page,
      limit,
      message: `${paginatedBoards.length}개의 워크플로우 보드를 조회했습니다.`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('워크플로우 보드 조회 오류:', error);
    
    const errorResponse: WorkflowBoardsResponse = {
      success: false,
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      message: '워크플로우 보드 조회 중 오류가 발생했습니다.'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
