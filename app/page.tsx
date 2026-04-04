'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type Todo = {
  id: string
  text: string
  time: string
  done: boolean
  created_at: number
}

// 同期ID管理
function getSyncId(): string {
  let id = localStorage.getItem('sync_id')
  if (!id) {
    id = crypto.randomUUID().slice(0, 8).toUpperCase()
    localStorage.setItem('sync_id', id)
  }
  return id
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [time, setTime] = useState('')
  const [syncId, setSyncId] = useState('')
  const [inputSyncId, setInputSyncId] = useState('')
  const [showSyncPanel, setShowSyncPanel] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  // 同期IDの初期化とURLパラメータの確認
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlSyncId = params.get('sync')
    if (urlSyncId) {
      localStorage.setItem('sync_id', urlSyncId.toUpperCase())
      window.history.replaceState({}, '', window.location.pathname)
    }
    setSyncId(getSyncId())
  }, [])

  // Supabaseからデータ取得
  const fetchTodos = useCallback(async (id: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
    if (data) setTodos(data as Todo[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!syncId) return
    fetchTodos(syncId)

    // リアルタイム同期
    const channel = supabase
      .channel('todos-' + syncId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${syncId}` },
        () => fetchTodos(syncId)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [syncId, fetchTodos])

  const addTodo = async () => {
    const text = input.trim()
    if (!text || !syncId) return
    const newTodo: Todo & { user_id: string } = {
      id: crypto.randomUUID(),
      user_id: syncId,
      text,
      time,
      done: false,
      created_at: Date.now(),
    }
    setTodos(prev => [newTodo, ...prev])
    setInput('')
    setTime('')
    inputRef.current?.focus()
    await supabase.from('todos').insert(newTodo)
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    const updated = !todo.done
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: updated } : t))
    await supabase.from('todos').update({ done: updated }).eq('id', id)
  }

  const deleteTodo = async (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
    await supabase.from('todos').delete().eq('id', id)
  }

  const deleteCompleted = async () => {
    const doneIds = todos.filter(t => t.done).map(t => t.id)
    setTodos(prev => prev.filter(t => !t.done))
    await supabase.from('todos').delete().in('id', doneIds)
  }

  // 同期コードをコピー
  const copySyncId = () => {
    navigator.clipboard.writeText(syncId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 別デバイスの同期コードを適用
  const applySyncId = () => {
    const newId = inputSyncId.trim().toUpperCase()
    if (!newId) return
    localStorage.setItem('sync_id', newId)
    setSyncId(newId)
    setInputSyncId('')
    setShowSyncPanel(false)
  }

  const remaining = todos.filter(t => !t.done).length
  const total = todos.length

  return (
    <main className="min-h-screen flex items-start justify-center pt-12 px-4 pb-12">
      <div className="w-full max-w-md">

        {/* ヘッダー */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
              ToDoリスト
            </h1>
            {total > 0 && (
              <p className="mt-1 text-sm text-stone-400">
                {remaining} / {total} 件が未完了
              </p>
            )}
          </div>
          {/* 同期ボタン */}
          <button
            onClick={() => setShowSyncPanel(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
              showSyncPanel
                ? 'bg-stone-800 text-white'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            同期
          </button>
        </div>

        {/* 同期パネル */}
        {showSyncPanel && (
          <div className="mb-6 p-4 bg-white border border-stone-100 rounded-2xl space-y-4">
            {/* 自分の同期コード */}
            <div>
              <p className="text-xs text-stone-400 mb-1.5">このデバイスの同期コード</p>
              <div className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-stone-50 rounded-lg font-mono text-base font-semibold text-stone-700 tracking-widest text-center">
                  {syncId}
                </span>
                <button
                  onClick={copySyncId}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                    copied ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {copied ? 'コピー済み' : 'コピー'}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-stone-300">
                このコードを他のデバイスで入力すると同じリストを共有できます
              </p>
            </div>

            {/* 他のデバイスのコードを入力 */}
            <div>
              <p className="text-xs text-stone-400 mb-1.5">他のデバイスのコードを入力</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputSyncId}
                  onChange={e => setInputSyncId(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white font-mono text-base text-stone-700 tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
                />
                <button
                  onClick={applySyncId}
                  disabled={inputSyncId.trim().length < 8}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 disabled:opacity-30 transition"
                >
                  適用
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 入力フォーム */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-300 text-base focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
            />
            <button
              onClick={addTodo}
              disabled={!input.trim()}
              className="px-5 py-3 rounded-xl bg-stone-800 text-white text-base font-medium hover:bg-stone-700 active:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              追加
            </button>
          </div>

          {/* 時間入力（任意） */}
          <div className="flex items-center gap-2 px-1">
            <svg className="w-4 h-4 text-stone-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-36 px-3 py-2 rounded-lg border border-stone-200 bg-white text-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
            />
            <span className="text-xs text-stone-300">予定時間（任意）</span>
            {time && (
              <button onClick={() => setTime('')} className="text-xs text-stone-300 hover:text-stone-500 transition">
                クリア
              </button>
            )}
          </div>
        </div>

        {/* タスク一覧 */}
        {loading ? (
          <div className="text-center py-16 text-stone-300 text-sm">読み込み中...</div>
        ) : todos.length === 0 ? (
          <div className="text-center py-16 text-stone-300 text-sm">タスクがありません</div>
        ) : (
          <ul className="space-y-2">
            {todos.map(todo => (
              <li
                key={todo.id}
                className="flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-stone-100 hover:border-stone-200 transition"
              >
                {/* チェックボタン */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full active:bg-stone-100 transition"
                  aria-label={todo.done ? '未完了に戻す' : '完了にする'}
                >
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                    todo.done ? 'bg-stone-800 border-stone-800' : 'border-stone-300'
                  }`}>
                    {todo.done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 5l2.5 2.5 4.5-4.5" />
                      </svg>
                    )}
                  </span>
                </button>

                {/* テキスト＋時間 */}
                <div className="flex-1 min-w-0">
                  <span className={`block text-sm leading-relaxed transition ${
                    todo.done ? 'text-stone-300 line-through' : 'text-stone-700'
                  }`}>
                    {todo.text}
                  </span>
                  {todo.time && (
                    <span className={`flex items-center gap-1 mt-0.5 text-xs transition ${
                      todo.done ? 'text-stone-200' : 'text-stone-400'
                    }`}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                      </svg>
                      {todo.time}
                    </span>
                  )}
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-stone-300 hover:text-stone-500 active:bg-stone-100 transition"
                  aria-label="削除"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" d="M2 2l10 10M12 2L2 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* 完了済みを一括削除 */}
        {todos.some(t => t.done) && (
          <div className="mt-4 text-right">
            <button
              onClick={deleteCompleted}
              className="py-2 px-3 text-xs text-stone-400 hover:text-stone-600 active:text-stone-800 transition"
            >
              完了済みをすべて削除
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
