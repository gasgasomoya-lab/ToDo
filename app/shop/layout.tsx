// ショップ全体のレイアウト
// app/shop/ 以下のすべてのページに共通のヘッダーが付く

import ShopHeader from './_components/ShopHeader'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <ShopHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
