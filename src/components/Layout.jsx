import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Layout({ children }) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">TaskFlow</span>
          {user && (
            <>
              <Link href="/dashboard" className="hover:underline text-sm">Dashboard</Link>
              <Link href="/projects" className="hover:underline text-sm">Projetos</Link>
              <Link href="/calendar" className="hover:underline text-sm">Calendário</Link>
            </>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.email}</span>
            <button onClick={handleLogout} className="bg-blue-900 px-3 py-1 rounded text-sm hover:bg-blue-800">Sair</button>
          </div>
        )}
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
