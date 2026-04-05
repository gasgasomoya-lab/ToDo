'use client'

// 商品一覧ページ
// Supabaseから商品を取得して表示する
// まだSupabaseにデータがない場合はサンプルデータを使う

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// 商品の型定義
export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category: string
  stock: number
}

// SupabaseにまだデータがないときのサンプルデータKK
// Supabaseに商品を登録したら自動的にそちらが使われる
const SAMPLE_PRODUCTS: Product[] = [
  { id: '1', name: 'クラシックTシャツ',    description: '柔らかいコットン素材の定番Tシャツ。着心地抜群。',       price: 2980, image_url: null, category: 'ウェア', stock: 10 },
  { id: '2', name: 'コーヒーマグ',          description: '大容量360mlのセラミックマグカップ。電子レンジ対応。',  price: 1580, image_url: null, category: 'キッチン', stock: 5  },
  { id: '3', name: '方眼ノートA5',          description: '書きやすい上質紙を使用したA5サイズの方眼ノート。',      price: 880,  image_url: null, category: '文具', stock: 20 },
  { id: '4', name: 'キャンバストートバッグ', description: '丈夫なキャンバス素材。マチ広で荷物がたっぷり入る。',   price: 1980, image_url: null, category: 'バッグ', stock: 8  },
  { id: '5', name: 'ステンレスボトル',       description: '真空断熱で保温・保冷OK。500ml。',                     price: 3480, image_url: null, category: 'キッチン', stock: 15 },
  { id: '6', name: 'ウォールカレンダー',     description: 'シンプルなデザインのA2サイズ壁掛けカレンダー。',      price: 780,  image_url: null, category: '文具', stock: 30 },
]

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('すべて')

  useEffect(() => {
    async function fetchProducts() {
      // Supabaseから商品を取得
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        // DBにデータがあればそちらを使う
        setProducts(data as Product[])
      } else {
        // なければサンプルデータを表示
        setProducts(SAMPLE_PRODUCTS)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  // カテゴリの一覧を重複なしで取得
  const categories = ['すべて', ...Array.from(new Set(products.map(p => p.category)))]

  // 選択中のカテゴリで絞り込み
  const filtered = selectedCategory === 'すべて'
    ? products
    : products.filter(p => p.category === selectedCategory)

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-800 mb-2">商品一覧</h1>
      <p className="text-sm text-stone-400 mb-6">{products.length}件の商品</p>

      {/* カテゴリフィルタ */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              selectedCategory === cat
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 商品グリッド */}
      {loading ? (
        <div className="text-center py-16 text-stone-300 text-sm">読み込み中...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(product => (
            <Link
              key={product.id}
              href={`/shop/${product.id}`}
              className="bg-white rounded-2xl border border-stone-100 hover:border-stone-300 hover:shadow-sm transition overflow-hidden group"
            >
              {/* 商品画像（または色付きプレースホルダー） */}
              <div className="aspect-square bg-stone-100 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  // 画像がない場合は頭文字を表示
                  <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-stone-400">
                      {product.name[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* 商品情報 */}
              <div className="p-3">
                <p className="text-xs text-stone-400 mb-0.5">{product.category}</p>
                <h2 className="text-sm font-medium text-stone-800 mb-1 leading-snug">{product.name}</h2>
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-stone-800">
                    ¥{product.price.toLocaleString()}
                  </p>
                  {product.stock === 0 && (
                    <span className="text-xs text-red-400">在庫なし</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
