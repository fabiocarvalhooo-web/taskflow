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
    const [{ data: proj }, { data: tsk }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at"),
      supabase.from("tasks").select("*").order("created_at"),
    ])
    setProjects(proj || [])
    setTasks(tsk || [])
    setLoading(false)
  }

  const today = new Date()
  const todayStr = today.toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
  const completed = tasks.filter((t) => t.status === "completed")
  const rate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0
  const highPriority = tasks.filter((t) => t.status !== "completed" && t.priority === "Alta")
  const overdue = tasks.filter((t) => {
    if (t.status === "completed" || !t.due_date) return false
    return new Date(t.due_date) < today
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const startWeek = new Date(today); startWeek.setDate(today.getDate() - today.getDay())
  const endWeek = new Date(startWeek); endWeek.setDate(startWeek.getDate() + 6)
  const thisWeek = tasks.filter((t) => {
    if (!t.due_date) return false
    const d = new Date(t.due_date)
    return d >= startWeek && d <= endWeek
  })

  function dotColor(p) {
    if (p === "Alta") return "#ef4444"
    if (p === "Media" || p === "Média") return "#f59e0b"
    return "#22c55e"
  }

  async function sendStatus() {
    const res = await fetch("/api/send-email", { method: "POST" })
    if (res.ok) alert("Status enviado!")
    else alert("Erro ao enviar.")
  }

  if (loading) return <><Nav /><div className="loading">Carregando...</div></>

  return (
    <>
      <Nav />
      <div className="page-wrapper">
        <div className="header">
          <div>
            <h1>Rumo</h1>
            <div className="date">{todayStr}</div>
          </div>
          <button className="btn-primary" onClick={sendStatus}>✉️ Enviar Status Atual</button>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="label">Taxa de Conclusão <span>📊</span></div>
            <div className={"value orange"}>{rate}%</div>
            <div className="sub">{completed.length} de {tasks.length} tarefas</div>
            <div className="link">Clique para ver →</div>
          </div>
          <div className="stat-card">
            <div className="label">Esta Semana <span>📅</span></div>
            <div className={"value blue"}>{thisWeek.length}</div>
            <div className="sub">de {tasks.filter(t=>t.due_date).length} tarefas com prazo</div>
            <div className="link">Clique para ver →</div>
          </div>
          <div className="stat-card">
            <div className="label">Alta Prioridade <span>🔴</span></div>
            <div className={"value red"}>{highPriority.length}</div>
            <div className="sub">tarefas pendentes</div>
            <div className="link">Clique para ver →</div>
          </div>
          <div className="stat-card">
            <div className="label">Atrasadas <span>⚠️</span></div>
            <div className={"value red"}>{overdue.length}</div>
            <div className="sub">tarefas vencidas</div>
            <div className="link">Clique para ver →</div>
          </div>
        </div>
        {overdue.length > 0 && (
          <div className="overdue-section">
            <h2>⚠️ {overdue.length} tarefas atrasadas</h2>
            {overdue.map((t) => {
              const proj = projects.find((p) => p.id === t.project_id)
              const days = Math.ceil((today.getTime() - new Date(t.due_date).getTime()) / 86400000)
              return (
                <div key={t.id} className="overdue-row">
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:dotColor(t.priority),display:"inline-block",marginTop:5,flexShrink:0}}/>
                    <div>
                      <div className="task-name">{t.title}</div>
                      <div className="task-meta">{proj?.name}{t.responsible_name && <> · 👤 <span style={{color:"#3b82f6"}}>{t.responsible_name}</span></>}</div>
                    </div>
                  </div>
                  <span className="days-badge">{days} {days===1?"dia":"dias"} atraso</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
