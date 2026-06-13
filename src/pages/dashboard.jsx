import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Dashboard() {
  const user = useUser()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user === null) router.push('/')
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    const [{ data: proj }, { data: tsk }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('tasks').select('*, projects(name)').eq('status', 'pending').order('due_date', { ascending: true }).limit(10)
    ])
    setProjects(proj || [])
    setTasks(tsk || [])
    setLoading(false)
  }

  if (!user || loading) return <Layout><p className="text-gray-500">Carregando...</p></Layout>

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Projetos recentes</h2>
            <Link href="/projects" className="text-blue-600 text-sm hover:underline">Ver todos</Link>
          </div>
          {projects.length === 0 ? <p className="text-gray-400 text-sm">Nenhum projeto ainda.</p> : (
            <ul className="space-y-2">
              {projects.map(p => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50">
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.organization}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Tarefas pendentes</h2>
          {tasks.length === 0 ? <p className="text-gray-400 text-sm">Nenhuma tarefa pendente.</p> : (
            <ul className="space-y-2">
              {tasks.map(t => (
                <li key={t.id} className="p-3 rounded-lg border border-gray-100">
                  <p className="font-medium text-gray-800 text-sm">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.projects?.name} · {t.due_date || 'Sem prazo'}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticProps() { return { props: {} } }
