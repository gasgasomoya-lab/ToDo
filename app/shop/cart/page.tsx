'use client'

// カートページ
// カートの中身を一覧表示し、数量変更・削除・注文確認ができる

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/cartContext'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalCount } = useCart()
  const [ordered, setOrdered] = useState(false) // 注文完了フラグ

  // 注文確定（今はUIのデモのみ、後でAPI連携可能）
  const handleOrder = () => {
    setOrdered(true)
    clearCart()
  }

  // 注文完了後の画面
  if (ordered) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-stone-800 mb-2">ご注文ありがとうございます</h1>
        <p className="text-sm text-stone-400 mb-6">注文を受け付けました。</p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition"
        >
          買い物を続ける
        </Link>
      </div>
    )
  }

  // カートが空の場合
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-stone-400 mb-6">カートに商品が入っていません</p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition"
        >
          商品を見る
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">
        カート
        <span className="text-base font-normal text-stone-400 ml-2">{totalCount}点</span>
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 左：カート商品リスト */}
        <div className="md:col-span-2 space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-100 p-4 flex gap-4"
            >
              {/* 商品画像 */}
              <Link href={`/shop/${item.id}`}>
                <div className="w-20 h-20 bg-stone-100 rounded-xl flex items-center justify-center shrink-0 hover:opacity-80 transition">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-xl font-semibold text-stone-400">{item.name[0]}</span>
                  )}
                </div>
              </Link>

              {/* 商品情報 */}
              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.id}`}>
                  <h3 className="text-sm font-medium text-stone-800 hover:text-stone-600 transition mb-1">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm font-semibold text-stone-800 mb-3">
                  ¥{item.price.toLocaleString()}
                </p>

                {/* 数量コントロール */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* -ボタン */}
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition text-lg leading-none"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-stone-800">
                      {item.quantity}
                    </span>
                    {/* +ボタン */}
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition text-lg leading-none"
                    >
                      +
                    </button>
                  </div>

                  {/* 小計 */}
                  <p className="text-sm font-semibold text-stone-600">
                    ¥{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 削除ボタン */}
              <button
                onClick={() => removeItem(item.id)}
                className="shrink-0 w-8 h-8 rounded-lg text-stone-300 hover:text-stone-500 hover:bg-stone-50 flex items-center justify-center transition self-start"
                aria-label="削除"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* 右：注文サマリー */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-100 p-5 sticky top-20">
            <h2 className="text-base font-semibold text-stone-800 mb-4">注文内容</h2>

            {/* 小計 */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-stone-500">
                <span>小計</span>
                <span>¥{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>送料</span>
                <span className="text-green-600">無料</span>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 mb-4">
              <div className="flex justify-between font-semibold text-stone-800">
                <span>合計</span>
                <span>¥{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* 注文確定ボタン */}
            <button
              onClick={handleOrder}
              className="w-full py-3.5 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 active:bg-stone-900 transition"
            >
              注文を確定する
            </button>

            <Link
              href="/shop"
              className="mt-3 block text-center text-sm text-stone-400 hover:text-stone-600 transition"
            >
              買い物を続ける
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
