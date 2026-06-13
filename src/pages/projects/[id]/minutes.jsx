import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '../../../lib/supabase'
import Layout from '../../../components/Layout'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function Minutes() {
  const user = useUser()
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState(null)
  const [minutes, setMinutes] = useState([])
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    if (user === null) router.push('/')
    if (user && id) fetchData()
  }, [user, id])

  const fetchData = async () => {
    const [{ data: proj }, { data: min }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('minutes').select('*').eq('project_id', id).order('created_at', { ascending: false })
    ])
    setProject(proj)
    setMinutes(min || [])
  }

  const createMinute = async () => {
    if (!title.trim()) return
    const { error } = await supabase.from('minutes').insert({ title, body, project_id: id })
    if (error) toast.error('Erro ao salvar ata')
    else { toast.success('Ata salva!'); setShowNew(false); setTitle(''); setBody(''); fetchData() }
  }

  return (
    <Layout>
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm text-gray-400 mb-1">
            <Link href="/projects" className="hover:underline">Projetos</Link>
            {project && <> / <Link href={`/projects/${id}`} className="hover:underline">{project.name}</Link></>}
            {' / Atas'}
          </p>
          <h1 className="text-2xl font-bold text-gray-800">Atas de reunião</h1>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800">+ Nova ata</button>
      </div>
      {showNew && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <input placeholder="Título da ata" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2 mb-2 text-sm" />
          <textarea placeholder="Conteúdo da ata..." value={body} onChange={e => setBody(e.target.value)} className="w-full border rounded px-3 py-2 mb-3 text-sm" rows={6} />
          <div className="flex gap-2">
            <button onClick={createMinute} className="bg-blue-700 text-white px-4 py-2 rounded text-sm">Salvar</button>
            <button onClick={() => setShowNew(false)} className="border px-4 py-2 rounded text-sm">Cancelar</button>
          </div>
        </div>
      )}
      <div className="flex gap-4">
        <div className="w-64 shrink-0 space-y-2">
          {minutes.length === 0 && <p className="text-gray-400 text-sm">Nenhuma ata ainda.</p>}
          {minutes.map(m => (
            <div key={m.id} onClick={() => setSelected(m)} className={`p-3 rounded-lg cursor-pointer border ${selected?.id === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}>
              <p className="font-medium text-sm text-gray-800">{m.title}</p>
              <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 bg-white rounded-xl shadow p-5">
          {selected ? (
            <>
              <h2 className="font-bold text-lg mb-2">{selected.title}</h2>
              <p className="text-xs text-gray-400 mb-4">{new Date(selected.created_at).toLocaleString('pt-BR')}</p>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{selected.body}</p>
            </>
          ) : (
            <p className="text-gray-400 text-center mt-10">Selecione uma ata</p>
          )}
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticPaths() { return { paths: [], fallback: 'blocking' } }
export async function getStaticProps() { return { props: {} } }
