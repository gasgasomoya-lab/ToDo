'use client'

import { useState, useEffect, useRef } from 'react'

type Todo = {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('todos')
    if (saved) setTodos(JSON.parse(saved))
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos, mounted])

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos(prev => [
      { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() },
      ...prev,
    ])
    setInput('')
    inputRef.current?.focus()
  }

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const remaining = todos.filter(t => !t.done).length
  const total = todos.length

  if (!mounted) return null

  return (
    <main className="min-h-screen flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md">

        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
            ToDoリスト
          </h1>
          {total > 0 && (
            <p className="mt-1 text-sm text-stone-400">
              {remaining} / {total} 件が未完了
            </p>
          )}
        </div>

        {/* 入力フォーム */}
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 transition"
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="px-4 py-2.5 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            追加
          </button>
        </div>

        {/* タスク一覧 */}
        {todos.length === 0 ? (
          <div className="text-center py-16 text-stone-300 text-sm">
            タスクがありません
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map(todo => (
              <li
                key={todo.id}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-stone-100 group hover:border-stone-200 transition"
              >
                {/* チェックボックス */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    todo.done
                      ? 'bg-stone-800 border-stone-800'
                      : 'border-stone-300 hover:border-stone-500'
                  }`}
                  aria-label={todo.done ? '未完了に戻す' : '完了にする'}
                >
                  {todo.done && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 5l2.5 2.5 4.5-4.5" />
                    </svg>
                  )}
                </button>

                {/* テキスト */}
                <span
                  className={`flex-1 text-sm leading-relaxed transition ${
                    todo.done ? 'text-stone-300 line-through' : 'text-stone-700'
                  }`}
                >
                  {todo.text}
                </span>

                {/* 削除ボタン */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-stone-300 hover:text-stone-500 hover:bg-stone-50 opacity-0 group-hover:opacity-100 transition"
                  aria-label="削除"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={2}>
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
              onClick={() => setTodos(prev => prev.filter(t => !t.done))}
              className="text-xs text-stone-400 hover:text-stone-600 transition"
            >
              完了済みをすべて削除
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
