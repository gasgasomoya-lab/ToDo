'use client'

// ショップのヘッダーコンポーネント
// カート個数を表示するためにClient Componentにしている

import Link from 'next/link'
import { useCart } from '@/lib/cartContext'

export default function ShopHeader() {
  const { totalCount } = useCart()

  return (
    <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 左側：ロゴ＋ナビ */}
        <div className="flex items-center gap-6">
          <Link href="/shop" className="text-base font-semibold text-stone-800 hover:text-stone-600 transition">
            Shop
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/shop" className="text-sm text-stone-500 hover:text-stone-800 transition">
              商品一覧
            </Link>
          </nav>
        </div>

        {/* 右側：カートボタン＋ToDoへのリンク */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-stone-400 hover:text-stone-600 transition">
            ToDoへ
          </Link>

          {/* カートボタン：個数バッジ付き */}
          <Link
            href="/shop/cart"
            className="relative flex items-center gap-1.5 px-3 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            カート
            {/* 個数バッジ：0のときは非表示 */}
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
