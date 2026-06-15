"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Nav from "@/components/Nav"
import Toast from "@/components/Toast"

const COLORS = ["#3b82f6","#ef4444","#f59e0b","#22c55e","#8b5cf6","#ec4899","#14b8a6","#f97316","#64748b"]
const emptyForm = { title:"", priority:"Media", due_date:"", responsible_name:"", responsible_email:"", note:"" }

export default function ProjetosPage() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [userId, setUserId] = useState("")
  const [expanded, setExpanded] = useState(new Set())
  const [addingTask, setAddingTask] = useState(null)
  const [taskForm, setTaskForm] = useState(emptyForm)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProject, setNewProject] = useState({name:"",description:"",color:COLORS[0],area:""})
  const [editTask, setEditTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = "/login"; return }
    setUserId(user.id)
    const [{ data: proj, error: pe }, { data: tsk, error: te }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at"),
      supabase.from("tasks").select("*").order("created_at"),
    ])
    if (pe) console.error("Erro projetos:", pe)
    if (te) console.error("Erro tarefas:", te)
    setProjects(proj||[]); setTasks(tsk||[])
    setExpanded(new Set((proj||[]).map((p)=>p.id)))
    setLoading(false)
  }

  const getPT = (pid) => tasks.filter((t)=>t.project_id===pid)
  const getProgress = (pid) => {
    const pt = getPT(pid); if (!pt.length) return {done:0,total:0,pct:0}
    const done = pt.filter((t)=>t.status==="completed").length
    return {done,total:pt.length,pct:Math.round((done/pt.length)*100)}
  }
  const isOverdue = (t) => { if (t.status==="completed"||!t.due_date) return false; return new Date(t.due_date)<new Date() }
  const fmtDate = (d) => new Date(d+"T12:00:00").toLocaleDateString("pt-BR")
  const toggleExpand = (id) => setExpanded((prev)=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})
  const pClass = (p) => "badge badge-"+(p==="Alta"?"alta":p==="Média"||p==="Media"?"media":"baixa")
  const showToast = (message, type="success") => { setToast({message,type}); setTimeout(()=>setToast(null),3000) }

  function addToCalendar(task) {
    if (!task.due_date) { showToast("Adicione um prazo primeiro.","error"); return }
    const d = task.due_date.replace(/-/g,"")
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${d}/${d}&details=${encodeURIComponent(task.note||"")}`)
  }

  async function toggleTask(task) {
    const s = task.status==="completed"?"pending":"completed"
    const completedAt = s==="completed" ? new Date().toISOString() : null
    const { error } = await supabase.from("tasks").update({status:s, completed_at: completedAt}).eq("id",task.id)
    if (error) { showToast("Erro ao atualizar tarefa: "+error.message,"error"); return }
    setTasks((prev)=>prev.map((t)=>t.id===task.id?{...t,status:s,completed_at:completedAt}:t))
  }

  async function addTask(pid) {
    if (!taskForm.title.trim()) { showToast("Informe o titulo da tarefa.","error"); return }
    const { data, error } = await supabase.from("tasks").insert({
      project_id:pid, title:taskForm.title,
      priority:taskForm.priority==="Media"?"Média":taskForm.priority,
      due_date:taskForm.due_date||null,
      responsible_name:taskForm.responsible_name||null,
      responsible_email:taskForm.responsible_email||null,
      note:taskForm.note||null, status:"pending", created_by:userId
    }).select().single()
    if (error) { showToast("Erro ao criar tarefa.","error"); return }
    setTasks((prev)=>[...prev,data])
    setAddingTask(null); setTaskForm(emptyForm)
    showToast("Tarefa criada!")
  }

  async function deleteTask(id) {
    if (!confirm("Excluir esta tarefa?")) return
    const { error } = await supabase.from("tasks").delete().eq("id",id)
    if (error) { showToast("Erro ao excluir.","error"); return }
    setTasks((prev)=>prev.filter((t)=>t.id!==id))
    showToast("Tarefa excluida.")
  }

  async function saveEdit() {
    if (!editTask||!editTask.title.trim()) return
    const { data, error } = await supabase.from("tasks").update({
      title:editTask.title,
      priority:editTask.priority==="Media"?"Média":editTask.priority,
      due_date:editTask.due_date||null,
      responsible_name:editTask.responsible_name||null,
      responsible_email:editTask.responsible_email||null,
      note:editTask.note||null,
      final_decision:editTask.final_decision||null
    }).eq("id",editTask.id).select().single()
    if (error) { showToast("Erro ao salvar.","error"); return }
    setTasks((prev)=>prev.map((t)=>t.id===data.id?data:t))
    setEditTask(null); showToast("Tarefa atualizada!")
  }

  async function addProject() {
    if (!newProject.name.trim()) { showToast("Informe o nome do projeto.","error"); return }
    const { data, error } = await supabase.from("projects").insert({
      name:newProject.name, description:newProject.description||null,
      color:newProject.color, area:newProject.area||null, owner_id:userId
    }).select().single()
    if (error) { showToast("Erro ao criar projeto: "+error.message,"error"); return }
    setProjects((prev)=>[...prev,data])
    setExpanded((prev)=>new Set([...prev,data.id]))
    setShowNewProject(false); setNewProject({name:"",description:"",color:COLORS[0],area:""})
    showToast("Projeto criado!")
  }

  async function deleteProject(id) {
    if (!confirm("Excluir este projeto e todas as tarefas?")) return
    await supabase.from("tasks").delete().eq("project_id",id)
    const { error } = await supabase.from("projects").delete().eq("id",id)
    if (error) { showToast("Erro ao excluir projeto.","error"); return }
    setProjects((prev)=>prev.filter((p)=>p.id!==id))
    setTasks((prev)=>prev.filter((t)=>t.project_id!==id))
    showToast("Projeto excluido.")
  }

  if (loading) return <><Nav /><div className="loading">Carregando...</div></>

  return (
    <>
      <Nav />
      <div className="page-wrapper">
        <div className="header">
          <div>
            <h1>Rumo</h1>
            <div className="date">{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <button className="btn-primary" onClick={()=>setShowNewProject(true)}>+ Novo Projeto</button>
        </div>
        <div className="section-header">
          <h2>Projetos <span className="count">{projects.length}</span></h2>
        </div>
        {projects.length===0&&<div className="empty"><p>Nenhum projeto ainda.</p><p style={{marginTop:8}}>Clique em + Novo Projeto para comecar.</p></div>}
        {projects.map((project)=>{
          const prog=getProgress(project.id); const pt=getPT(project.id); const isOpen=expanded.has(project.id)
          return (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <span className="project-color-dot" style={{background:project.color||"#3b82f6"}}/>
                <div className="project-info">
                  <div className="project-name">{project.name}</div>
                  {project.description&&<div className="project-desc">{project.description}</div>}
                </div>
                <div className="project-actions">
                  <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:`${prog.pct}%`,background:project.color||"#3b82f6"}}/></div>
                  <span className="progress-text">{prog.done}/{prog.total}</span>
                  <button className="btn-ghost" onClick={()=>deleteProject(project.id)} title="Excluir projeto">🗑️</button>
                  <button className="btn-ghost" onClick={()=>toggleExpand(project.id)}>{isOpen?"▲":"▼"}</button>
                </div>
              </div>
              {isOpen&&<>
                {pt.length>0&&(
                  <div className="tasks-list">
                    {pt.map((task)=>(
                      <div key={task.id} className={"task-row"+(isOverdue(task)?" overdue":"")}>
                        <input type="checkbox" className="task-checkbox" checked={task.status==="completed"} onChange={()=>toggleTask(task)}/>
                        <div className="task-content">
                          <div className={"task-title"+(task.status==="completed"?" done":"")}>
                            {task.title}
                            {isOverdue(task)&&<span style={{marginLeft:8,fontSize:12,color:"#ef4444"}}>⚠️ Atrasada</span>}
                          </div>
                          <div className="task-badges">
                            <span className={pClass(task.priority)}>{task.priority}</span>
                            {task.due_date&&<span className="badge badge-date">📅 {fmtDate(task.due_date)}</span>}
                            {task.responsible_name&&<span className="badge badge-person">👤 {task.responsible_name}</span>}
                            {task.note&&<span className="badge badge-note">📝 nota</span>}
                            {task.final_decision&&<span className="badge badge-decision">⚖️ decisao</span>}
                          </div>
                        </div>
                        <div className="task-row-actions">
                          <button className="btn-ghost" onClick={()=>addToCalendar(task)} title="Adicionar ao Google Calendar">🗓️</button>
                          <button className="btn-ghost" onClick={()=>setEditTask({...task})} title="Editar">✏️</button>
                          <button className="btn-ghost" onClick={()=>deleteTask(task.id)} title="Excluir">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {addingTask===project.id?(
                  <div className="add-task-form">
                    <input type="text" placeholder="Titulo da tarefa" value={taskForm.title} onChange={(e)=>setTaskForm((f)=>({...f,title:e.target.value}))} autoFocus onKeyDown={(e)=>e.key==="Enter"&&addTask(project.id)}/>
                    <div className="form-row">
                      <select value={taskForm.priority} onChange={(e)=>setTaskForm((f)=>({...f,priority:e.target.value}))} style={{flex:1}}>
                        <option value="Alta">🔴 Alta</option>
                        <option value="Media">🟡 Media</option>
                        <option value="Baixa">🟢 Baixa</option>
                      </select>
                      <input type="date" value={taskForm.due_date} onChange={(e)=>setTaskForm((f)=>({...f,due_date:e.target.value}))} style={{flex:1}}/>
                    </div>
                    <textarea placeholder="📝 Notas (opcional)" value={taskForm.note} onChange={(e)=>setTaskForm((f)=>({...f,note:e.target.value}))} rows={2}/>
                    <div className="form-row">
                      <input type="text" placeholder="👤 Nome do responsavel" value={taskForm.responsible_name} onChange={(e)=>setTaskForm((f)=>({...f,responsible_name:e.target.value}))}/>
                      <input type="email" placeholder="✉️ E-mail" value={taskForm.responsible_email} onChange={(e)=>setTaskForm((f)=>({...f,responsible_email:e.target.value}))}/>
                    </div>
                    <div className="form-actions">
                      <button className="btn-secondary" onClick={()=>{setAddingTask(null);setTaskForm(emptyForm)}}>Cancelar</button>
                      <button className="btn-primary" onClick={()=>addTask(project.id)}>Adicionar</button>
                    </div>
                  </div>
                ):(
                  <div className="add-task-trigger" onClick={()=>{setAddingTask(project.id);setTaskForm(emptyForm)}}>+ Adicionar tarefa</div>
                )}
              </>}
            </div>
          )
        })}
        {showNewProject&&(
          <div className="modal-overlay" onClick={(e)=>e.target===e.currentTarget&&setShowNewProject(false)}>
            <div className="modal">
              <h2>Novo Projeto</h2>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <input type="text" placeholder="Nome do projeto *" value={newProject.name} onChange={(e)=>setNewProject((p)=>({...p,name:e.target.value}))} autoFocus onKeyDown={(e)=>e.key==="Enter"&&addProject()}/>
                <input type="text" placeholder="Descricao (opcional)" value={newProject.description} onChange={(e)=>setNewProject((p)=>({...p,description:e.target.value}))}/>
                <input type="text" placeholder="Area (ex: UNDB, Vivo)" value={newProject.area} onChange={(e)=>setNewProject((p)=>({...p,area:e.target.value}))}/>
                <div>
                  <div style={{fontSize:12,color:"#6b7280",marginBottom:8}}>Cor do projeto</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {COLORS.map((c)=>(
                      <button key={c} onClick={()=>setNewProject((p)=>({...p,color:c}))} style={{width:28,height:28,borderRadius:"50%",background:c,border:"none",cursor:"pointer",outline:newProject.color===c?`3px solid ${c}`:"none",outlineOffset:2}}/>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={()=>setShowNewProject(false)}>Cancelar</button>
                <button className="btn-primary" onClick={addProject}>Criar Projeto</button>
              </div>
            </div>
          </div>
        )}
        {editTask&&(
          <div className="modal-overlay" onClick={(e)=>e.target===e.currentTarget&&setEditTask(null)}>
            <div className="modal">
              <h2>Editar Tarefa</h2>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <input type="text" value={editTask.title} onChange={(e)=>setEditTask((t)=>({...t,title:e.target.value}))} placeholder="Titulo"/>
                <div className="form-row">
                  <select value={editTask.priority} onChange={(e)=>setEditTask((t)=>({...t,priority:e.target.value}))} style={{flex:1}}>
                    <option value="Alta">🔴 Alta</option>
                    <option value="Média">🟡 Media</option>
                    <option value="Baixa">🟢 Baixa</option>
                  </select>
                  <input type="date" value={editTask.due_date||""} onChange={(e)=>setEditTask((t)=>({...t,due_date:e.target.value}))} style={{flex:1}}/>
                </div>
                <div className="form-row">
                  <input type="text" placeholder="Nome do responsavel" value={editTask.responsible_name||""} onChange={(e)=>setEditTask((t)=>({...t,responsible_name:e.target.value}))}/>
                  <input type="email" placeholder="E-mail" value={editTask.responsible_email||""} onChange={(e)=>setEditTask((t)=>({...t,responsible_email:e.target.value}))}/>
                </div>
                <textarea placeholder="📝 Nota" rows={2} value={editTask.note||""} onChange={(e)=>setEditTask((t)=>({...t,note:e.target.value}))}/>
                <textarea placeholder="⚖️ Decisao final" rows={2} value={editTask.final_decision||""} onChange={(e)=>setEditTask((t)=>({...t,final_decision:e.target.value}))}/>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={()=>setEditTask(null)}>Cancelar</button>
                <button className="btn-primary" onClick={saveEdit}>Salvar</button>
              </div>
            </div>
          </div>
        )}
        {toast&&<Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)}/>}
      </div>
    </>
  )
}
