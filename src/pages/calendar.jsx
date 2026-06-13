import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import { useRouter } from 'next/router'

export default function Calendar() {
  const user = useUser()
  const router = useRouter()
  const [tasks, setTasks] = useState([])
  const [today] = useState(new Date())

  useEffect(() => {
    if (user === null) router.push('/')
    if (user) fetchTasks()
  }, [user])

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*, projects(name)').not('due_date', 'is', null).order('due_date', { ascending: true })
    setTasks(data || [])
  }

  const grouped = tasks.reduce((acc, t) => {
    const d = t.due_date
    if (!acc[d]) acc[d] = []
    acc[d].push(t)
    return acc
  }, {})

  const priorityColor = { high: 'border-l-red-500', medium: 'border-l-yellow-500', low: 'border-l-green-500' }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Calendário de tarefas</h1>
      {Object.keys(grouped).length === 0 && <p className="text-gray-400">Nenhuma tarefa com prazo definido.</p>}
      <div className="space-y-6">
        {Object.keys(grouped).sort().map(date => {
          const d = new Date(date + 'T00:00:00')
          const isToday = d.toDateString() === today.toDateString()
          const isPast = d < today && !isToday
          return (
            <div key={date}>
              <h2 className={`font-semibold mb-2 ${isToday ? 'text-blue-700' : isPast ? 'text-red-500' : 'text-gray-700'}`}>
                {isToday ? '📌 Hoje — ' : isPast ? '⚠️ ' : '📅 '}
                {d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </h2>
              <div className="space-y-2">
                {grouped[date].map(t => (
                  <div key={t.id} className={`bg-white rounded-lg shadow p-3 border-l-4 ${priorityColor[t.priority]}`}>
                    <p className="font-medium text-gray-800">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.projects?.name} {t.responsible_name ? `· ${t.responsible_name}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}

export async function getStaticProps() { return { props: {} } }
