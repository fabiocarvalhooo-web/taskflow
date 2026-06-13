"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Nav from "@/components/Nav"

export default function AtasPage() {
  const [projects, setProjects] = useState([])
  const [minutes, setMinutes] = useState([])
  const [items, setItems] = useState([])
  const [expanded, setExpanded] = useState(new Set())
  const [showNew, setShowNew] = useState(false)
  const [newMinute, setNewMinute] = useState({ project_id:"", title:"" })
  const [addingItem, setAddingItem] = useState(null)
  const [newItem, setNewItem] = useState({ tema:"", deliberacoes:"", responsavel:"", prazo:"", observacao:"" })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: proj }, { data: min }, { data: itm }] = await Promise.all([
      supabase.from("projects").select("*").order("name"),
      supabase.from("minutes").select("*").order("created_at", { ascending:false }),
      supabase.from("minute_items").select("*").order("created_at"),
    ])
    setProjects(proj||[]); setMinutes(min||[]); setItems(itm||[])
    setLoading(false)
  }

  const getItems = (mid) => items.filter((i) => i.minute_id === mid)
  const toggleExpand = (id) => setExpanded((prev) => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n })
  const fmtDate = (d) => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : ""

  async function createMinute() {
    if (!newMinute.title.trim()) return
    const { data } = await supabase.from("minutes").insert({ project_id:newMinute.project_id||null, title:newMinute.title }).select().single()
    if (data) { setMinutes((prev) => [data, ...prev]); setExpanded((prev) => new Set([...prev, data.id])) }
    setShowNew(false); setNewMinute({ project_id:"", title:"" })
  }

  async function addItem(mid) {
    if (!newItem.tema.trim()) return
    const { data } = await supabase.from("minute_items").insert({
      minute_id:mid, tema:newItem.tema, deliberacoes:newItem.deliberacoes||null,
      responsavel:newItem.responsavel||null, prazo:newItem.prazo||null, observacao:newItem.observacao||null
    }).select().single()
    if (data) setItems((prev) => [...prev, data])
    setAddingItem(null); setNewItem({ tema:"", deliberacoes:"", responsavel:"", prazo:"", observacao:"" })
  }

  async function deleteItem(id) {
    await supabase.from("minute_items").delete().eq("id", id)
    setItems((prev) => prev.filter((i) => i.id!==id))
  }

  async function deleteMinute(id) {
    if (!confirm("Excluir esta ata?")) return
    await supabase.from("minute_items").delete().eq("minute_id", id)
    await supabase.from("minutes").delete().eq("id", id)
    setMinutes((prev) => prev.filter((m) => m.id!==id))
    setItems((prev) => prev.filter((i) => i.minute_id!==id))
  }

  if (loading) return <><Nav /><div className="loading">Carregando...</div></>

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
        {minutes.length===0 && <div className="empty"><p>Nenhuma ata ainda.</p><p style={{marginTop:8}}>Clique em + Nova Ata para comecar.</p></div>}
        {minutes.map((minute) => {
          const mi = getItems(minute.id)
          const proj = projects.find((p) => p.id===minute.project_id)
          const isOpen = expanded.has(minute.id)
          return (
            <div key={minute.id} className="ata-card">
              <div className="ata-header" onClick={()=>toggleExpand(minute.id)}>
                <div>
                  <h3>{minute.title}</h3>
                  {proj && <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Projeto: {proj.name}</div>}
                  <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>{new Date(minute.created_at).toLocaleDateString("pt-BR")} · {mi.length} {mi.length===1?"item":"itens"}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <button className="btn-ghost" onClick={(e)=>{e.stopPropagation();deleteMinute(minute.id)}}>🗑️</button>
                  <span>{isOpen?"▲":"▼"}</span>
                </div>
              </div>
              {isOpen && (
                <div>
                  {mi.length > 0 && (
                    <div style={{overflowX:"auto"}}>
                      <table className="ata-table">
                        <thead><tr><th>Tema</th><th>Deliberacoes</th><th>Responsavel</th><th>Prazo</th><th>Observacao</th><th style={{width:40}}></th></tr></thead>
                        <tbody>
                          {mi.map((item) => (
                            <tr key={item.id}>
                              <td style={{fontWeight:500}}>{item.tema}</td>
                              <td>{item.deliberacoes||"—"}</td>
                              <td>{item.responsavel||"—"}</td>
                              <td>{item.prazo?fmtDate(item.prazo):"—"}</td>
                              <td>{item.observacao||"—"}</td>
                              <td><button className="btn-ghost" onClick={()=>deleteItem(item.id)} style={{fontSize:12}}>🗑️</button></td>
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
                        <button className="btn-secondary" onClick={()=>setAddingItem(null)}>Cancelar</button>
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
        {showNew && (
          <div className="modal-overlay" onClick={(e)=>e.target===e.currentTarget&&setShowNew(false)}>
            <div className="modal">
              <h2>Nova Ata de Reuniao</h2>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <input type="text" placeholder="Titulo da ata" value={newMinute.title} onChange={(e)=>setNewMinute((m)=>({...m,title:e.target.value}))} autoFocus/>
                <select value={newMinute.project_id} onChange={(e)=>setNewMinute((m)=>({...m,project_id:e.target.value}))}>
                  <option value="">Selecionar projeto (opcional)</option>
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
      </div>
    </>
  )
}
