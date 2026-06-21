'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Play, LayoutDashboard, Search, Settings, LogOut, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  user?: { email?: string; avatar?: string } | null
  timeSaved?: number
}

export default function Navbar({ user, timeSaved = 0 }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard', label: '대시보드', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/search', label: '다국어 검색', icon: <Search className="w-4 h-4" /> },
    { href: '/settings', label: '설정', icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-white hidden sm:block">TubeDigest AI</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="hidden sm:block">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {timeSaved > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 text-sm text-green-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">{Math.floor(timeSaved / 60)}시간 절약</span>
            </div>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm px-2 py-1.5 rounded-lg hover:bg-white/5"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">로그아웃</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
