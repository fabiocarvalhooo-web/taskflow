"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Nav from "@/components/Nav"
import Toast from "@/components/Toast"

export default function AtasPage() {
  const [projects, setProjects] = useState([])
  const [minutes, setMinutes] = useState([])
  const [items, setItems] = useState([])
  const [expanded, setExpanded] = useState(new Set())
  const [addingItem, setAddingItem] = useState(null)
  const [newItem, setNewItem] = useState({tema:"",deliberacoes:"",responsavel:"",prazo:"",observacao:""})
  const [showNew, setShowNew] = useState(false)
  const [newMinute, setNewMinute] = useState({project_id:"",title:""})
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(()=>{ loadData() },[])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href="/login"; return }
    const [{ data: proj },{ data: min },{ data: itm }] = await Promise.all([
      supabase.from("projects").select("*").order("name"),
      supabase.from("minutes").select("*").order("created_at",{ascending:false}),
      supabase.from("minute_items").select("*").order("created_at"),
    ])
    setProjects(proj||[]); setMinutes(min||[]); setItems(itm||[])
    setLoading(false)
  }

  const getItems = (mid) => items.filter((i)=>i.minute_id===mid)
  const toggleExpand = (id) => setExpanded((prev)=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})
  const fmtDate = (d) => d?new Date(d+"T12:00:00").toLocaleDateString("pt-BR"):""
  const showToast = (message, type="success") => setToast({message,type})

  async function createMinute() {
    if (!newMinute.title.trim()) { showToast("Informe o titulo da ata.","error"); return }
    const { data, error } = await supabase.from("minutes").insert({
      project_id: newMinute.project_id || null,
      title: newMinute.title
    }).select().single()
    if (error) { showToast("Erro ao criar ata: "+error.message,"error"); return }
    setMinutes((prev)=>[data,...prev])
    setExpanded((prev)=>new Set([...prev,data.id]))
    setAddingItem(data.id)
    setNewItem({tema:"",deliberacoes:"",responsavel:"",prazo:"",observacao:""})
    setShowNew(false); setNewMinute({project_id:"",title:""})
    showToast("Ata criada!")
  }

  async function addItem(mid) {
    if (!newItem.tema.trim()) { showToast("Informe o tema.","error"); return }
    const { data, error } = await supabase.from("minute_items").insert({
      minute_id:mid, tema:newItem.tema, deliberacoes:newItem.deliberacoes||null,
      responsavel:newItem.responsavel||null, prazo:newItem.prazo||null, observacao:newItem.observacao||null
    }).select().single()
    if (error) { showToast("Erro ao adicionar item: "+error.message,"error"); return }
    setItems((prev)=>[...prev,data])
    setNewItem({tema:"",deliberacoes:"",responsavel:"",prazo:"",observacao:""})
    showToast("Item adicionado!")
  }

  async function deleteItem(id) {
    const { error } = await supabase.from("minute_items").delete().eq("id",id)
    if (error) { showToast("Erro ao excluir item: "+error.message,"error"); return }
    setItems((prev)=>prev.filter((i)=>i.id!==id))
    showToast("Item excluido.")
  }

  async function deleteMinute(id) {
    if (!confirm("Excluir esta ata e todos os itens?")) return
    await supabase.from("minute_items").delete().eq("minute_id",id)
    const { error } = await supabase.from("minutes").delete().eq("id",id)
    if (error) { showToast("Erro ao excluir ata: "+error.message,"error"); return }
    setMinutes((prev)=>prev.filter((m)=>m.id!==id))
    setItems((prev)=>prev.filter((i)=>i.minute_id!==id))
    showToast("Ata excluida.")
  }

  if (loading) return <><Nav /><div className="loading">Carregando...</div></>

  const groups = []
  projects.forEach((p)=>{
    const pm = minutes.filter((m)=>m.project_id===p.id)
    if (pm.length) groups.push({project:p, list:pm})
  })
  const general = minutes.filter((m)=>!m.project_id)
  if (general.length) groups.push({project:null, list:general})

  return (
    <>
      <Nav />
      <div className="page-wrapper">
        <div className="header">
          <div>
            <h1>Atas de Reuniao</h1>
            <div className="date">{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
          <button className="btn-primary" onClick={()=>setShowNew(true)}>+ Nova Ata</button>
        </div>

        {minutes.length===0 && (
          <div className="empty">
            <p>Nenhuma ata ainda.</p>
            <p style={{marginTop:8}}>Clique em + Nova Ata para comecar.</p>
          </div>
        )}

        {groups.map((group)=>(
          <div key={group.project?group.project.id:"geral"} style={{marginBottom:28}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              {group.project && <span className="project-color-dot" style={{background:group.project.color||"#3b82f6"}}/>}
              <h2 style={{fontSize:15,fontWeight:700,color:"#374151"}}>{group.project?group.project.name:"Geral"}</h2>
              <span style={{fontSize:12,color:"#9ca3af"}}>({group.list.length})</span>
            </div>

            {group.list.map((minute)=>{
              const mi = getItems(minute.id)
              const isOpen = expanded.has(minute.id)
              return (
                <div key={minute.id} className="ata-card">
                  <div className="ata-header" onClick={()=>toggleExpand(minute.id)}>
                    <div>
                      <h3>{minute.title}</h3>
                      <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>
                        {new Date(minute.created_at).toLocaleDateString("pt-BR")} · {mi.length} {mi.length===1?"item":"itens"}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <button className="btn-ghost" onClick={(e)=>{e.stopPropagation();deleteMinute(minute.id)}}>🗑️</button>
                      <span>{isOpen?"▲":"▼"}</span>
                    </div>
                  </div>
                  {isOpen && (
                    <div>
                      {mi.length>0 && (
                        <div style={{overflowX:"auto"}}>
                          <table className="ata-table">
                            <thead>
                              <tr>
                                <th>Tema</th><th>Deliberacoes</th><th>Responsavel</th><th>Prazo</th><th>Observacao</th><th style={{width:40}}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {mi.map((item)=>(
                                <tr key={item.id}>
                                  <td style={{fontWeight:500}}>{item.tema}</td>
                                  <td>{item.deliberacoes||"—"}</td>
                                  <td>{item.responsavel||"—"}</td>
                                  <td>{item.prazo?fmtDate(item.prazo):"—"}</td>
                                  <td>{item.observacao||"—"}</td>
                                  <td><button className="btn-ghost" onClick={()=>deleteItem(item.id)}>🗑️</button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {addingItem===minute.id ? (
                        <div style={{padding:"16px 18px",borderTop:"1px solid var(--border)"}}>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                            <input type="text" placeholder="Tema *" value={newItem.tema} onChange={(e)=>setNewItem((i)=>({...i,tema:e.target.value}))} autoFocus/>
                            <input type="text" placeholder="Responsavel" value={newItem.responsavel} onChange={(e)=>setNewItem((i)=>({...i,responsavel:e.target.value}))}/>
                            <input type="date" value={newItem.prazo} onChange={(e)=>setNewItem((i)=>({...i,prazo:e.target.value}))}/>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                            <textarea placeholder="Deliberacoes" rows={2} value={newItem.deliberacoes} onChange={(e)=>setNewItem((i)=>({...i,deliberacoes:e.target.value}))}/>
                            <textarea placeholder="Observacao" rows={2} value={newItem.observacao} onChange={(e)=>setNewItem((i)=>({...i,observacao:e.target.value}))}/>
                          </div>
                          <div className="form-actions">
                            <button className="btn-secondary" onClick={()=>setAddingItem(null)}>Fechar</button>
                            <button className="btn-primary" onClick={()=>addItem(minute.id)}>Adicionar Item</button>
                          </div>
                        </div>
                      ) : (
                        <div className="add-task-trigger" onClick={()=>{setAddingItem(minute.id);setNewItem({tema:"",deliberacoes:"",responsavel:"",prazo:"",observacao:""})}}>+ Adicionar item a ata</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {showNew && (
          <div className="modal-overlay" onClick={(e)=>e.target===e.currentTarget&&setShowNew(false)}>
            <div className="modal">
              <h2>Nova Ata de Reuniao</h2>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <input type="text" placeholder="Titulo da ata *" value={newMinute.title} onChange={(e)=>setNewMinute((m)=>({...m,title:e.target.value}))} autoFocus onKeyDown={(e)=>e.key==="Enter"&&createMinute()}/>
                <select value={newMinute.project_id} onChange={(e)=>setNewMinute((m)=>({...m,project_id:e.target.value}))}>
                  <option value="">Geral (sem projeto)</option>
                  {projects.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={()=>setShowNew(false)}>Cancelar</button>
                <button className="btn-primary" onClick={createMinute}>Criar Ata</button>
              </div>
            </div>
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)}/>}
      </div>
    </>
  )
}
