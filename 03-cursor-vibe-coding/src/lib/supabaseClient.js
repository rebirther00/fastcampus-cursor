import { createClient } from '@supabase/supabase-js'

// Supabase 프로젝트 URL과 anon key를 환경변수에서 가져옵니다
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey)