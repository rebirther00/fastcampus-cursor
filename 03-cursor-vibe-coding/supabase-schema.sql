-- 칸반 보드 프로젝트 DB 스키마
-- Supabase SQL Editor에서 실행하세요

-- UUID 확장 활성화 (이미 활성화되어 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- boards 테이블 생성
CREATE TABLE IF NOT EXISTS boards (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    name text NOT NULL,
    slug text UNIQUE NOT NULL
);

-- columns 테이블 생성
CREATE TABLE IF NOT EXISTS columns (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    position integer NOT NULL,
    board_id uuid REFERENCES boards(id) ON DELETE CASCADE NOT NULL
);

-- cards 테이블 생성
CREATE TABLE IF NOT EXISTS cards (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    description text,
    position integer NOT NULL,
    column_id uuid REFERENCES columns(id) ON DELETE CASCADE NOT NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(board_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_column_id ON cards(column_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(column_id, position);
CREATE INDEX IF NOT EXISTS idx_boards_slug ON boards(slug);

-- Row Level Security (RLS) 활성화
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (익명 사용자 모든 작업 허용)
-- boards 테이블 정책
DROP POLICY IF EXISTS "Enable all operations for anon users" ON boards;
CREATE POLICY "Enable all operations for anon users" ON boards
    FOR ALL USING (true) WITH CHECK (true);

-- columns 테이블 정책
DROP POLICY IF EXISTS "Enable all operations for anon users" ON columns;
CREATE POLICY "Enable all operations for anon users" ON columns
    FOR ALL USING (true) WITH CHECK (true);

-- cards 테이블 정책
DROP POLICY IF EXISTS "Enable all operations for anon users" ON cards;
CREATE POLICY "Enable all operations for anon users" ON cards
    FOR ALL USING (true) WITH CHECK (true);

-- Realtime 활성화 (실시간 동기화용)
ALTER PUBLICATION supabase_realtime ADD TABLE boards;
ALTER PUBLICATION supabase_realtime ADD TABLE columns;
ALTER PUBLICATION supabase_realtime ADD TABLE cards;

-- 샘플 데이터 삽입 (테스트용)
INSERT INTO boards (name, slug) VALUES 
    ('샘플 프로젝트', 'sample-project'),
    ('신규 기능 개발', 'new-feature-dev')
ON CONFLICT (slug) DO NOTHING;

-- 샘플 보드의 기본 컬럼들 생성
DO $$
DECLARE
    sample_board_id uuid;
    new_feature_board_id uuid;
BEGIN
    -- 샘플 보드 ID 가져오기
    SELECT id INTO sample_board_id FROM boards WHERE slug = 'sample-project';
    SELECT id INTO new_feature_board_id FROM boards WHERE slug = 'new-feature-dev';
    
    -- 샘플 프로젝트 컬럼들
    IF sample_board_id IS NOT NULL THEN
        INSERT INTO columns (title, position, board_id) VALUES 
            ('할 일', 0, sample_board_id),
            ('진행 중', 1, sample_board_id),
            ('완료', 2, sample_board_id)
        ON CONFLICT DO NOTHING;
        
        -- 샘플 카드들
        INSERT INTO cards (title, description, position, column_id) 
        SELECT 
            '첫 번째 할 일', 
            '이것은 샘플 카드입니다.', 
            0, 
            c.id 
        FROM columns c 
        WHERE c.board_id = sample_board_id AND c.title = '할 일'
        ON CONFLICT DO NOTHING;
        
        INSERT INTO cards (title, description, position, column_id) 
        SELECT 
            '진행 중인 작업', 
            '현재 작업 중인 항목입니다.', 
            0, 
            c.id 
        FROM columns c 
        WHERE c.board_id = sample_board_id AND c.title = '진행 중'
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- 신규 기능 개발 보드 컬럼들
    IF new_feature_board_id IS NOT NULL THEN
        INSERT INTO columns (title, position, board_id) VALUES 
            ('백로그', 0, new_feature_board_id),
            ('개발 중', 1, new_feature_board_id),
            ('리뷰', 2, new_feature_board_id),
            ('배포 완료', 3, new_feature_board_id)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;