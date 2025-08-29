# 칸반 보드 프로젝트

React와 Supabase를 사용하여 구현한 실시간 협업 칸반 보드 애플리케이션입니다.

## 기술 스택

- **Frontend**: React.js, Zustand, @dnd-kit/core, React Router, TailwindCSS
- **Backend**: Supabase (Postgres DB, Realtime Subscriptions, Auto-generated APIs)
- **배포**: Vercel

## 주요 기능

- 📋 다중 보드 관리
- 📝 컬럼과 카드 CRUD 작업
- 🖱️ 드래그 앤 드롭으로 카드 이동
- ⚡ 실시간 동기화
- 🔒 익명 사용자 지원 (로그인 불필요)

## 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd kanban-board
npm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `.env.example`을 `.env`로 복사하고 Supabase 정보 입력:

```bash
cp .env.example .env
```

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 데이터베이스 스키마 생성

Supabase SQL Editor에서 다음 스키마를 실행하세요:

```sql
-- boards 테이블
CREATE TABLE boards (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    name text NOT NULL,
    slug text UNIQUE NOT NULL
);

-- columns 테이블
CREATE TABLE columns (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    position integer NOT NULL,
    board_id uuid REFERENCES boards(id) ON DELETE CASCADE NOT NULL
);

-- cards 테이블
CREATE TABLE cards (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    description text,
    position integer NOT NULL,
    column_id uuid REFERENCES columns(id) ON DELETE CASCADE NOT NULL
);

-- RLS 정책 (익명 사용자 접근 허용)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for anon users" ON boards
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for anon users" ON columns
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for anon users" ON cards
    FOR ALL USING (true) WITH CHECK (true);
```

### 4. 애플리케이션 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 프로젝트 구조

```
src/
├── components/          # 공용 UI 컴포넌트
│   ├── board/           # 보드 관련 컴포넌트
│   │   ├── Board.jsx
│   │   ├── Column.jsx
│   │   └── Card.jsx
│   └── common/          # 버튼, 모달 등 범용 컴포넌트
│       └── Button.jsx
├── pages/               # 라우팅 단위 페이지 컴포넌트
│   ├── HomePage.jsx     # 메인 페이지 (보드 목록, 새 보드 생성)
│   └── BoardPage.jsx    # 특정 보드 상세 페이지
├── lib/                 # 외부 서비스 설정
│   └── supabaseClient.js # Supabase 클라이언트 초기화
├── store/               # 전역 상태 관리 (Zustand)
│   └── boardStore.js    # 현재 보드의 데이터(열, 카드) 및 관련 함수 관리
├── App.jsx              # 라우터 설정 및 전역 레이아웃
└── index.js             # 애플리케이션 진입점
```

## 배포

### Vercel 배포

```bash
npm run build
# Vercel CLI 사용하거나 GitHub 연동으로 배포
```

환경변수를 Vercel 대시보드에서 설정해야 합니다:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## 개발 가이드

### 네이밍 컨벤션
- 컴포넌트 파일명: PascalCase (예: Board.jsx, HomePage.jsx)
- 보드 slug: kebab-case (예: "new-feature-dev")
- 데이터베이스 필드명: snake_case (예: board_id, created_at)

### 상태 관리
- Zustand를 사용하여 전역 상태 관리
- 데이터베이스 동기화 로직을 스토어 액션에 포함
- 실시간 동기화는 BoardPage에서 Supabase Realtime 구독으로 처리

## 라이선스

MIT License