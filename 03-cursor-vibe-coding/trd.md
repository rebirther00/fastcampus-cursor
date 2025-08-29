### **TRD (Technical Requirements Document) - 칸반 보드 프로젝트**

**1. 문서 개요**
*   **문서명:** 칸반 보드 기술 요구사항 명세서 (React & Supabase 기반)
*   **버전:** 1.1
*   **목표:** PRD의 메인 시나리오와 다중 보드 요구사항을 안정적으로 구현하기 위한 기술 스택, 아키텍처, 상세 데이터베이스 스키마를 정의합니다.

**2. 기술 스택**
*   **Frontend:** React.js, Zustand (상태 관리), @dnd-kit/core (드래그 앤 드롭), React Router (페이지 라우팅), Vercel (배포)
*   **Backend (BaaS):** Supabase (Postgres DB, Realtime Subscriptions, Auto-generated APIs)

**3. Frontend 폴더 구조 (확장)**

```
src/
├── components/          # 공용 UI 컴포넌트
│   ├── board/           # 보드 관련 컴포넌트
│   │   ├── Board.jsx
│   │   ├── Column.jsx
│   │   └── Card.jsx
│   └── common/          # 버튼, 모달 등 범용 컴포넌트
│       └── Button.jsx
│
├── pages/               # 라우팅 단위 페이지 컴포넌트
│   ├── HomePage.jsx     # 메인 페이지 (보드 목록, 새 보드 생성)
│   └── BoardPage.jsx    # 특정 보드 상세 페이지
│
├── lib/                 # 외부 서비스 설정
│   └── supabaseClient.js # Supabase 클라이언트 초기화
│
├── store/               # 전역 상태 관리 (Zustand)
│   └── boardStore.js    # 현재 보드의 데이터(열, 카드) 및 관련 함수 관리
│
├── App.jsx              # 라우터 설정 및 전역 레이아웃
└── index.js             # 애플리케이션 진입점
```

**4. Supabase DB 상세 스키마**

#### **4.1. `boards` 테이블**
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `uuid_generate_v4()` | 보드 고유 ID |
| `created_at` | `timestamptz` | Not Null, `now()` | 생성 시각 |
| `name` | `text` | Not Null | 보드 이름 (예: "신규 기능 개발") |
| `slug` | `text` | **Unique, Not Null** | URL 경로 (예: "new-feature-dev") |

#### **4.2. `columns` 테이블**
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `uuid_generate_v4()` | 열(Lane) 고유 ID |
| `title` | `text` | Not Null | 열 제목 (예: "할 일") |
| `position` | `integer` | Not Null | 보드 내 열 순서 |
| `board_id` | `uuid` | **Foreign Key to `boards.id`**, Not Null | 소속된 보드의 ID |

#### **4.3. `cards` 테이블**
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `uuid_generate_v4()` | 카드 고유 ID |
| `title` | `text` | Not Null | 카드 제목 |
| `description`| `text` | Nullable | 카드 상세 설명 |
| `position` | `integer` | Not Null | 열 내 카드 순서 |
| `column_id` | `uuid` | **Foreign Key to `columns.id`**, Not Null | 소속된 열의 ID |

**5. 핵심 기술 구현 방안**
*   **라우팅:** `React Router`를 사용하여 `/` (홈) 와 `/board/:slug` (보드 페이지) 경로를 관리합니다.
*   **데이터 Fetching:** `BoardPage.jsx`는 URL의 `:slug` 파라미터를 사용해 `boards` 테이블에서 보드 정보를 찾고, 해당 `board_id`로 `columns`와 `cards`를 연쇄적으로 조회하여 화면을 구성합니다.
*   **상태 관리:** `zustand` 스토어는 현재 보고 있는 보드의 열과 카드 데이터를 보관합니다. 데이터베이스와 동기화하는 로직(fetch, add, update, delete)을 스토어 액션에 포함시켜 컴포넌트의 복잡도를 낮춥니다.
*   **실시간 동기화:** `BoardPage.jsx`에서 `useEffect`를 통해 현재 `board_id`에 속한 `cards`와 `columns` 테이블의 변경사항을 구독(subscribe)합니다. 이벤트 수신 시 스토어의 데이터를 갱신하는 액션을 호출합니다.
*   **보안 (RLS):** 모든 테이블에 익명 사용자(`anon` role)가 모든 작업을 할 수 있도록 `USING (true)`, `WITH CHECK (true)` 정책을 적용하여 로그인 없는 협업을 지원합니다.