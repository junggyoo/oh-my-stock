'use client'

import { useState, useEffect } from 'react'
import { LogOut, User, Menu, X } from 'lucide-react'

interface AuthUser {
  id: string
  email: string
  name: string | null
}

export default function NavBar() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch {
        // Not logged in
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-2xl">📈</span>
          <span>Oh My Stock</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          {loading ? (
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          ) : user ? (
            <>
              <a href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                대시보드
              </a>
              <a href="/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                설정
              </a>
              <div className="ml-2 flex items-center gap-3 rounded-full border border-gray-200 py-1.5 pl-3 pr-1.5">
                <span className="text-sm text-gray-600">{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  title="로그아웃"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                로그인
              </a>
              <a
                href="/signup"
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                시작하기
              </a>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                {user.name || user.email}
              </div>
              <a href="/dashboard" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                대시보드
              </a>
              <a href="/settings" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                설정
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                로그인
              </a>
              <a href="/signup" className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200">
                시작하기
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
