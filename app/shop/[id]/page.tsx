'use client'

// 商品詳細ページ
// URLの [id] から商品IDを取得して、Supabaseまたはサンプルデータから商品情報を表示する
// カートに追加するボタンもここにある

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cartContext'
import type { Product } from '../page'

// 一覧ページと同じサンプルデータ（本来はAPIで取得するが学習用に直書き）
const SAMPLE_PRODUCTS: Product[] = [
  { id: '1', name: 'クラシックTシャツ',    description: '柔らかいコットン素材の定番Tシャツ。着心地抜群。',       price: 2980, image_url: null, category: 'ウェア', stock: 10 },
  { id: '2', name: 'コーヒーマグ',          description: '大容量360mlのセラミックマグカップ。電子レンジ対応。',  price: 1580, image_url: null, category: 'キッチン', stock: 5  },
  { id: '3', name: '方眼ノートA5',          description: '書きやすい上質紙を使用したA5サイズの方眼ノート。',      price: 880,  image_url: null, category: '文具', stock: 20 },
  { id: '4', name: 'キャンバストートバッグ', description: '丈夫なキャンバス素材。マチ広で荷物がたっぷり入る。',   price: 1980, image_url: null, category: 'バッグ', stock: 8  },
  { id: '5', name: 'ステンレスボトル',       description: '真空断熱で保温・保冷OK。500ml。',                     price: 3480, image_url: null, category: 'キッチン', stock: 15 },
  { id: '6', name: 'ウォールカレンダー',     description: 'シンプルなデザインのA2サイズ壁掛けカレンダー。',      price: 780,  image_url: null, category: '文具', stock: 30 },
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem, items } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false) // 「追加済み」フィードバック用

  // URLのIDに対応する商品を取得
  useEffect(() => {
    async function fetchProduct() {
      const id = params.id as string

      // まずSupabaseから取得を試みる
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setProduct(data as Product)
      } else {
        // なければサンプルデータから探す
        const sample = SAMPLE_PRODUCTS.find(p => p.id === id)
        setProduct(sample ?? null)
      }
      setLoading(false)
    }
    fetchProduct()
  }, [params.id])

  // カートに追加したとき一時的に「追加済み」を表示
  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // すでにカートに入っている数量を取得
  const cartItem = items.find(i => i.id === product?.id)
  const cartQuantity = cartItem?.quantity ?? 0

  if (loading) {
    return <div className="text-center py-16 text-stone-300 text-sm">読み込み中...</div>
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-400 mb-4">商品が見つかりませんでした</p>
        <Link href="/shop" className="text-sm text-stone-600 underline">一覧に戻る</Link>
      </div>
    )
  }

  return (
    <div>
      {/* パンくずリスト：現在地を示すナビゲーション */}
      <nav className="flex items-center gap-2 text-sm text-stone-400 mb-6">
        <Link href="/shop" className="hover:text-stone-600 transition">商品一覧</Link>
        <span>/</span>
        <span className="text-stone-600">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 商品画像エリア */}
        <div className="aspect-square bg-stone-100 rounded-2xl flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-stone-200 flex items-center justify-center">
              <span className="text-4xl font-semibold text-stone-400">{product.name[0]}</span>
            </div>
          )}
        </div>

        {/* 商品情報エリア */}
        <div className="flex flex-col">
          <p className="text-sm text-stone-400 mb-1">{product.category}</p>
          <h1 className="text-2xl font-semibold text-stone-800 mb-3">{product.name}</h1>
          <p className="text-3xl font-bold text-stone-800 mb-4">
            ¥{product.price.toLocaleString()}
            <span className="text-sm font-normal text-stone-400 ml-1">（税込）</span>
          </p>

          <p className="text-sm text-stone-500 leading-relaxed mb-6">{product.description}</p>

          {/* 在庫状況 */}
          <p className={`text-sm mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-400'}`}>
            {product.stock > 0 ? `残り ${product.stock} 点` : '在庫なし'}
          </p>

          {/* カートに入っている数量を表示 */}
          {cartQuantity > 0 && (
            <p className="text-sm text-stone-400 mb-2">
              現在カートに {cartQuantity} 点入っています
            </p>
          )}

          {/* カートに追加ボタン */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-3.5 rounded-2xl text-base font-medium transition ${
              added
                ? 'bg-green-600 text-white'
                : product.stock === 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-800 text-white hover:bg-stone-700 active:bg-stone-900'
            }`}
          >
            {added ? 'カートに追加しました' : product.stock === 0 ? '在庫なし' : 'カートに追加'}
          </button>

          {/* カートを見るリンク */}
          {cartQuantity > 0 && (
            <Link
              href="/shop/cart"
              className="mt-3 w-full py-3 rounded-2xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-100 transition text-center block"
            >
              カートを見る
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
