// 특정 워크플로우 보드 상세 조회 API

import { NextRequest, NextResponse } from 'next/server';
import { mockWorkflowBoards } from '@/lib/mock-data';
import { WorkflowBoardResponse } from '@/types/workflow';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { params } = context;
  const resolvedParams = await params;
  
  try {
    const { id } = resolvedParams;

    // ID로 보드 찾기
    const board = mockWorkflowBoards.find(b => b.id === id);

    if (!board) {
      const notFoundResponse: WorkflowBoardResponse = {
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {} as any,
        message: `ID '${id}'에 해당하는 워크플로우 보드를 찾을 수 없습니다.`
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    // 성공 응답
    const response: WorkflowBoardResponse = {
      success: true,
      data: board,
      message: '워크플로우 보드를 성공적으로 조회했습니다.'
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('워크플로우 보드 상세 조회 오류:', error);
    
    const errorResponse: WorkflowBoardResponse = {
      success: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {} as any,
      message: '워크플로우 보드 조회 중 오류가 발생했습니다.'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
