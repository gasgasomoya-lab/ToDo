'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// カートに入れる商品の型
export type CartItem = {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number // 数量
}

// カートが持つ機能の型
type CartContextType = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void  // カートに追加
  removeItem: (id: string) => void                      // カートから削除
  updateQuantity: (id: string, quantity: number) => void // 数量変更
  clearCart: () => void                                 // カートを空にする
  totalCount: number  // 合計個数
  totalPrice: number  // 合計金額
}

// Contextを作成（初期値はnull）
const CartContext = createContext<CartContextType | null>(null)

// CartProviderコンポーネント：アプリ全体をこれで囲むとカート情報を共有できる
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // ページを再読み込みしてもカートを保持するためlocalStorageから復元
  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  // itemsが変わるたびにlocalStorageへ保存
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  // カートに商品を追加（すでに入っていれば数量+1）
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  // カートから削除
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  // 数量を変更（0以下なら削除）
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  // カートを全部空にする
  const clearCart = () => setItems([])

  // 合計個数・合計金額を計算
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

// useCart()：カート情報を使いたいコンポーネントから呼び出す
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart は CartProvider の中で使ってください')
  return ctx
}
