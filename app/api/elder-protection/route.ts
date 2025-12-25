/**
 * 노인보호전문기관 게시판 API
 * 경기북서부노인보호전문기관 직원만 접근 가능
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireElderProtection } from '@/lib/auth-middleware';
import { getContents, logUserActivity } from '@/lib/db';

/**
 * GET /api/elder-protection
 * 노인보호전문기관 게시판 콘텐츠 조회
 * 
 * 접근 권한: 경기북서부노인보호전문기관 직원만
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 및 권한 확인
    const { user, error } = requireElderProtection(request);

    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          message: error?.message || '권한이 없습니다.',
        },
        { status: error?.status || 403 }
      );
    }

    // 콘텐츠 조회 (elder-protection 카테고리)
    const contents = await getContents(
      'elder-protection',
      user.department_name,
      user.role === 'admin'
    );

    // 활동 로그 기록
    await logUserActivity(
      user.id,
      'view_elder_protection',
      undefined,
      { count: contents.length },
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      data: contents,
      user: {
        email: user.email,
        department: user.department_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Elder protection API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '콘텐츠 조회 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/elder-protection
 * 노인보호전문기관 게시판 콘텐츠 생성
 * 
 * 접근 권한: 관리자만
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 및 권한 확인
    const { user, error } = requireElderProtection(request);

    if (error || !user) {
      return NextResponse.json(
        {
          success: false,
          message: error?.message || '권한이 없습니다.',
        },
        { status: error?.status || 403 }
      );
    }

    // 관리자 권한 확인
    if (user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: '콘텐츠 생성은 관리자만 가능합니다.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, summary, full_content, source, source_url, tags, is_highlight } = body;

    // 필수 필드 검증
    if (!title || !full_content || !source) {
      return NextResponse.json(
        {
          success: false,
          message: '제목, 내용, 출처는 필수입니다.',
        },
        { status: 400 }
      );
    }

    // TODO: 데이터베이스 연결 후 실제 구현
    // 현재는 Mock 응답
    const newContent = {
      id: 'mock-content-id',
      title,
      summary: summary || '',
      full_content,
      category: 'elder-protection',
      source,
      source_url: source_url || '',
      tags: tags || [],
      is_highlight: is_highlight || false,
      access_level: 'department_only',
      allowed_departments: ['경기북서부노인보호전문기관'],
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // 활동 로그 기록
    await logUserActivity(
      user.id,
      'create_elder_protection_content',
      newContent.id,
      { title },
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      message: '콘텐츠가 생성되었습니다.',
      data: newContent,
    });
  } catch (error) {
    console.error('Elder protection content creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '콘텐츠 생성 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
