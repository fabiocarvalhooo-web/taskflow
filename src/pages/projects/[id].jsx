import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '../../lib/supabase'
import Layout from '../../components/Layout'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'

const PRIORITIES = ['high', 'medium', 'low']
const STATUSES = ['pending', 'in_progress', 'done']
const STATUS_LABELS = { pending: 'Pendente', in_progress: 'Em andamento', done: 'Concluída' }
const PRIORITY_COLORS = { high: 'bg-red-100 text-red-700', medium: 'bg-yellow-100 text-yellow-700', low: 'bg-green-100 text-green-700' }

export default function ProjectDetail() {
  const user = useUser()
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState('medium')
  const [responsible, setResponsible] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (user === null) router.push('/')
    if (user && id) fetchData()
  }, [user, id])

  const fetchData = async () => {
    const [{ data: proj }, { data: tsk }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false })
    ])
    setProject(proj)
    setTasks(tsk || [])
  }

  const createTask = async () => {
    if (!title.trim()) return
    const { error } = await supabase.from('tasks').insert({ title, description: desc, priority, responsible_name: responsible, due_date: dueDate || null, project_id: id, status: 'pending' })
    if (error) toast.error('Erro ao criar tarefa')
    else { toast.success('Tarefa criada!'); setShowNew(false); setTitle(''); setDesc(''); setResponsible(''); setDueDate(''); fetchData() }
  }

  const updateStatus = async (taskId, status) => {
    await supabase.from('tasks').update({ status }).eq('id', taskId)
    fetchData()
  }

  if (!project) return <Layout><p className="text-gray-400">Carregando...</p></Layout>

  return (
    <Layout>
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm text-gray-400 mb-1"><Link href="/projects" className="hover:underline">Projetos</Link> / {project.name}</p>
          <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">{project.organization}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${id}/minutes`} className="border px-3 py-2 rounded text-sm hover:bg-gray-50">Atas</Link>
          <button onClick={() => setShowNew(true)} className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800">+ Tarefa</button>
        </div>
      </div>
      {showNew && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h2 className="font-semibold mb-3">Nova tarefa</h2>
          <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2 mb-2 text-sm" />
          <textarea placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} className="w-full border rounded px-3 py-2 mb-2 text-sm" rows={2} />
          <div className="grid grid-cols-3 gap-2 mb-3">
            <select value={priority} onChange={e => setPriority(e.target.value)} className="border rounded px-3 py-2 text-sm">
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input placeholder="Responsável" value={responsible} onChange={e => setResponsible(e.target.value)} className="border rounded px-3 py-2 text-sm" />
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="border rounded px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={createTask} className="bg-blue-700 text-white px-4 py-2 rounded text-sm">Criar</button>
            <button onClick={() => setShowNew(false)} className="border px-4 py-2 rounded text-sm">Cancelar</button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {tasks.length === 0 && <p className="text-gray-400 text-sm">Nenhuma tarefa ainda.</p>}
        {tasks.map(t => (
          <div key={t.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                <h3 className="font-medium text-gray-800">{t.title}</h3>
              </div>
              {t.responsible_name && <p className="text-xs text-gray-400">👤 {t.responsible_name}</p>}
              {t.due_date && <p className="text-xs text-gray-400">📅 {t.due_date}</p>}
            </div>
            <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)} className="text-sm border rounded px-2 py-1">
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export async function getStaticPaths() { return { paths: [], fallback: 'blocking' } }
export async function getStaticProps() { return { props: {} } }
