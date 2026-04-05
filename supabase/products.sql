-- =====================================================
-- Supabase 商品テーブル セットアップ
-- =====================================================
-- Supabaseのダッシュボード → SQL Editor で実行してください
-- URL: https://supabase.com → プロジェクト選択 → SQL Editor
-- =====================================================

-- 1. productsテーブルを作成
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  price       integer not null check (price >= 0), -- 価格（円）
  image_url   text,                                 -- 商品画像のURL（nullでもOK）
  category    text not null default '',
  stock       integer not null default 0 check (stock >= 0), -- 在庫数
  created_at  timestamptz not null default now()
);

-- 2. 誰でも読み取り可能にする（RLS: Row Level Security）
alter table products enable row level security;

create policy "商品は誰でも閲覧できる"
  on products for select
  using (true);

-- 3. サンプルデータを挿入
insert into products (name, description, price, image_url, category, stock) values
  ('クラシックTシャツ',    '柔らかいコットン素材の定番Tシャツ。着心地抜群。',       2980, null, 'ウェア',   10),
  ('コーヒーマグ',          '大容量360mlのセラミックマグカップ。電子レンジ対応。',  1580, null, 'キッチン',  5),
  ('方眼ノートA5',          '書きやすい上質紙を使用したA5サイズの方眼ノート。',      880,  null, '文具',     20),
  ('キャンバストートバッグ', '丈夫なキャンバス素材。マチ広で荷物がたっぷり入る。',   1980, null, 'バッグ',    8),
  ('ステンレスボトル',       '真空断熱で保温・保冷OK。500ml。',                     3480, null, 'キッチン', 15),
  ('ウォールカレンダー',     'シンプルなデザインのA2サイズ壁掛けカレンダー。',       780,  null, '文具',     30);

-- =====================================================
-- 確認クエリ（挿入後に実行して確認してください）
-- =====================================================
-- select * from products;
