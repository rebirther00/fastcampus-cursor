# Supabase 설정 가이드

## 1. 프로젝트 생성 후 필요한 정보

프로젝트 대시보드의 **Settings > API**에서 다음 정보를 확인하세요:

### 필요한 정보들:
- **Project URL**: `https://your-project-id.supabase.co`
- **anon (public) key**: `eyJ...` (긴 JWT 토큰)
- **service_role key**: `eyJ...` (관리자용 키, 보안 주의)

## 2. 환경변수 설정

아래 명령어로 환경변수를 설정합니다:

```bash
# .env 파일 생성
echo "REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co" > .env
echo "REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here" >> .env
```

## 3. 데이터베이스 스키마 생성

Supabase 대시보드의 **SQL Editor**에서 `supabase-schema.sql` 파일의 내용을 실행하세요.

## 4. 테스트

애플리케이션을 실행하여 연결을 테스트합니다:

```bash
npm start
```