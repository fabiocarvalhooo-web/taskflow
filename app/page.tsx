"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Nav from "@/components/Nav"

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = "/login"; return }
    const [{ data: proj }, { data: tsk }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at"),
      supabase.from("tasks").select("*").order("created_at"),
    ])
    setProjects(proj || []); setTasks(tsk || [])
    setLoading(false)
  }

  const today = new Date()
  const todayStr = today.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})
  const completed = tasks.filter((t) => t.status==="completed")
  const rate = tasks.length>0?Math.round((completed.length/tasks.length)*100):0
  const alta = tasks.filter((t) => t.status!=="completed"&&t.priority==="Alta")
  const overdue = tasks.filter((t) => {
    if (t.status==="completed"||!t.due_date) return false
    return new Date(t.due_date)<today
  }).sort((a,b)=>new Date(a.due_date).getTime()-new Date(b.due_date).getTime())
  const sw = new Date(today); sw.setDate(today.getDate()-today.getDay())
  const ew = new Date(sw); ew.setDate(sw.getDate()+6)
  const week = tasks.filter((t) => { if (!t.due_date) return false; const d=new Date(t.due_date); return d>=sw&&d<=ew })
  const dotColor = (p) => p==="Alta"?"#ef4444":p==="Media"||p==="Média"?"#f59e0b":"#22c55e"

  if (loading) return <><Nav /><div className="loading">Carregando...</div></>

  return (
    <>
      <Nav />
      <div className="page-wrapper">
        <div className="header">
          <div><h1>Rumo</h1><div className="date">{todayStr}</div></div>
          <button className="btn-primary" onClick={()=>window.location.href="/fechamento"}>✉️ Fechamento de Sexta</button>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="label">Taxa de Conclusao <span>📊</span></div>
            <div className="value orange">{rate}%</div>
            <div className="sub">{completed.length} de {tasks.length} tarefas</div>
          </div>
          <div className="stat-card">
            <div className="label">Esta Semana <span>📅</span></div>
            <div className="value blue">{week.length}</div>
            <div className="sub">tarefas com prazo esta semana</div>
          </div>
          <div className="stat-card">
            <div className="label">Alta Prioridade <span>🔴</span></div>
            <div className="value red">{alta.length}</div>
            <div className="sub">tarefas pendentes</div>
          </div>
          <div className="stat-card">
            <div className="label">Atrasadas <span>⚠️</span></div>
            <div className="value red">{overdue.length}</div>
            <div className="sub">tarefas vencidas</div>
          </div>
        </div>
        {overdue.length>0&&(
          <div className="overdue-section">
            <h2>⚠️ {overdue.length} tarefas atrasadas</h2>
            {overdue.map((t)=>{
              const proj = projects.find((p)=>p.id===t.project_id)
              const days = Math.ceil((today.getTime()-new Date(t.due_date).getTime())/86400000)
              return (
                <div key={t.id} className="overdue-row">
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:dotColor(t.priority),display:"inline-block",marginTop:5,flexShrink:0}}/>
                    <div>
                      <div className="task-name">{t.title}</div>
                      <div className="task-meta">{proj?.name}{t.responsible_name&&<> · 👤 <span style={{color:"#3b82f6"}}>{t.responsible_name}</span></>}</div>
                    </div>
                  </div>
                  <span className="days-badge">{days} {days===1?"dia":"dias"} atraso</span>
                </div>
              )
            })}
          </div>
        )}
        {overdue.length===0&&tasks.length===0&&(
          <div className="empty">
            <p style={{fontSize:16,marginBottom:8}}>Bem-vindo ao Rumo! 🎯</p>
            <p>Comece criando seu primeiro projeto em <a href="/projetos" style={{color:"#3b82f6"}}>Projetos</a>.</p>
          </div>
        )}
      </div>
    </>
  )
}
