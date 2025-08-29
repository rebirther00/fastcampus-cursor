### **Supabase DB 상세 스키마 정의**

이 구조는 총 3개의 테이블(`boards`, `columns`, `cards`)로 구성되어 서로 관계를 맺습니다.

*   `boards`: 최상위 그룹인 칸반 보드 자체를 정의합니다. (예: "3분기 마케팅 프로젝트", "신규 기능 개발")
*   `columns`: 각 보드에 속한 세로 열(Lane)을 정의합니다. (예: "백로그", "디자인", "개발", "테스트")
*   `cards`: 각 열에 속한 개별 업무 카드를 정의합니다.

---

#### **1. `boards` 테이블**
프로젝트나 팀 단위로 생성되는 최상위 칸반 보드입니다.

```sql
-- boards 테이블: 여러 개의 칸반 보드를 관리합니다.
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),          -- 보드의 고유 ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),            -- 생성 시각
  name TEXT NOT NULL,                                      -- 보드의 이름 (예: "Q3 마케팅 캠페인")
  slug TEXT UNIQUE NOT NULL                                -- URL에 사용될 짧고 уника한 이름 (예: "q3-marketing-campaign")
);

-- 설명:
-- 사용자는 여러 개의 'board'를 생성할 수 있습니다.
-- 'slug' 컬럼은 'my-app.com/board/q3-marketing-campaign'과 같이
-- 각 보드에 접근할 수 있는 고유한 경로를 만드는 데 사용됩니다.
```

#### **2. `columns` 테이블**
특정 보드(`board`)에 소속되는 '할 일', '진행 중'과 같은 상태 열(Lane)입니다. 이 구조 덕분에 보드마다 다른 열 구성을 가질 수 있습니다.

```sql
-- columns 테이블: 각 보드에 속한 열(Lane)들을 관리합니다.
CREATE TABLE public.columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),          -- 열의 고유 ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),            -- 생성 시각
  title TEXT NOT NULL,                                     -- 열의 제목 (예: "할 일", "진행 중", "완료")
  position INT NOT NULL,                                   -- 보드 내에서 열의 순서 (0, 1, 2, ...)
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE -- 어떤 보드에 속해있는지를 나타내는 외래키
);

-- 설명:
-- 'board_id'는 이 열이 어떤 보드에 속하는지를 명시합니다.
-- 'ON DELETE CASCADE' 설정으로 인해, 상위 'boards' 테이블에서 특정 보드가 삭제되면
-- 그 보드에 속한 모든 'columns' 데이터도 함께 자동으로 삭제됩니다.
-- 'position'으로 열의 순서(좌->우)를 자유롭게 변경할 수 있습니다.
```

#### **3. `cards` 테이블**
가장 하위 단위인 개별 업무 카드입니다. 특정 열(`column`)에 소속됩니다.

```sql
-- cards 테이블: 각 열에 속한 업무 카드들을 관리합니다.
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),          -- 카드의 고유 ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),            -- 생성 시각
  title TEXT NOT NULL,                                     -- 카드의 제목
  description TEXT,                                        -- 카드의 상세 설명 (선택 사항)
  position INT NOT NULL,                                   -- 열 내에서 카드의 순서 (0, 1, 2, ...)
  column_id UUID NOT NULL REFERENCES public.columns(id) ON DELETE CASCADE -- 어떤 열에 속해있는지를 나타내는 외래키
);

-- 설명:
-- 'column_id'는 이 카드가 어떤 열에 속하는지를 명시합니다.
-- 마찬가지로 'ON DELETE CASCADE'를 통해, 상위 'columns' 테이블에서
-- 특정 열이 삭제되면 그 열에 속한 모든 카드도 함께 삭제됩니다.
-- 기존 스키마의 'status' 컬럼이 'column_id' 외래키로 대체되어
-- 더 유연하고 명확한 구조를 가집니다.
```

---

### **새로운 스키마의 장점 및 데이터 흐름**

*   **확장성 및 유연성:** 사용자가 직접 보드를 생성하고, 각 보드마다 원하는 이름과 개수로 열(Lane)을 커스터마이징할 수 있습니다. "할 일, 진행 중, 완료"로 고정되지 않습니다.
*   **명확한 데이터 구조:** 어떤 카드가 어떤 열과 어떤 보드에 속해 있는지 관계가 명확해져 데이터 관리가 용이합니다.
*   **개선된 사용자 경험:** 사용자는 URL(`.../board/board-slug`)을 통해 자신이 참여하는 특정 보드에만 집중할 수 있습니다.

**데이터 조회 흐름 예시:**

1.  사용자가 특정 보드 URL (`/board/q3-marketing-campaign`)에 접속합니다.
2.  애플리케이션은 URL의 `slug` ("q3-marketing-campaign")를 이용해 `boards` 테이블에서 해당 보드의 `id`를 조회합니다.
3.  조회된 `board_id`를 사용하여 `columns` 테이블에서 해당 보드에 속한 모든 열(column)들을 `position` 순으로 가져옵니다.
4.  가져온 각 `column_id`를 사용하여 `cards` 테이블에서 해당 열에 속한 모든 카드를 `position` 순으로 가져옵니다.
5.  가져온 데이터를 화면에 렌더링하여 칸반 보드를 구성합니다.