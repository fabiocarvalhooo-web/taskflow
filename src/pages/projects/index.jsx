import { useEffect, useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '../../lib/supabase'
import Layout from '../../components/Layout'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'

const ORGS = ['UNDB', 'Vivo Ocidental', 'Policlínica', 'Pessoal']

export default function Projects() {
  const user = useUser()
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [org, setOrg] = useState('UNDB')
  const [desc, setDesc] = useState('')

  useEffect(() => {
    if (user === null) router.push('/')
    if (user) fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data || [])
  }

  const createProject = async () => {
    if (!name.trim()) return
    const { error } = await supabase.from('projects').insert({ name, organization: org, description: desc, user_id: user.id })
    if (error) toast.error('Erro ao criar projeto')
    else { toast.success('Projeto criado!'); setShowNew(false); setName(''); setDesc(''); fetchProjects() }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Projetos</h1>
        <button onClick={() => setShowNew(true)} className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm">+ Novo projeto</button>
      </div>
      {showNew && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h2 className="font-semibold mb-3">Novo projeto</h2>
          <input placeholder="Nome do projeto" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 mb-2 text-sm" />
          <select value={org} onChange={e => setOrg(e.target.value)} className="w-full border rounded px-3 py-2 mb-2 text-sm">
            {ORGS.map(o => <option key={o}>{o}</option>)}
          </select>
          <textarea placeholder="Descrição (opcional)" value={desc} onChange={e => setDesc(e.target.value)} className="w-full border rounded px-3 py-2 mb-3 text-sm" rows={2} />
          <div className="flex gap-2">
            <button onClick={createProject} className="bg-blue-700 text-white px-4 py-2 rounded text-sm">Criar</button>
            <button onClick={() => setShowNew(false)} className="border px-4 py-2 rounded text-sm">Cancelar</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(p => (
          <Link key={p.id} href={`/projects/${p.id}`}>
            <div className="bg-white rounded-xl shadow p-5 hover:shadow-md cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{p.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{p.organization}</span>
              </div>
              {p.description && <p className="text-sm text-gray-500">{p.description}</p>}
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  )
}

export async function getStaticProps() { return { props: {} } }
