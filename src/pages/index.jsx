import { useState, useEffect } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Home() {
  const user = useUser()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user])

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    let result
    if (isRegister) {
      result = await supabase.auth.signUp({ email, password })
    } else {
      result = await supabase.auth.signInWithPassword({ email, password })
    }
    if (result.error) setError(result.error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">TaskFlow</h1>
        <p className="text-gray-500 mb-6">Sua agenda de trabalho pessoal</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <button onClick={handleAuth} disabled={loading} className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 disabled:opacity-50">
          {loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
        </button>
        <p className="text-center text-sm mt-4 text-gray-500">
          {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-600 hover:underline">
            {isRegister ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
      </div>
    </div>
  )
}
