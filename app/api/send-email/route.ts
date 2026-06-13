import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const [{ data: projects },{ data: tasks }] = await Promise.all([
      supabase.from("projects").select("*").order("name"),
      supabase.from("tasks").select("*").order("created_at"),
    ])
    const proj = projects||[]; const tsk = tasks||[]
    const completed = tsk.filter((t)=>t.status==="completed")
    const rate = tsk.length>0?Math.round((completed.length/tsk.length)*100):0
    const overdue = tsk.filter((t)=>{if(t.status==="completed"||!t.due_date)return false;return new Date(t.due_date)<new Date()})
    const alta = tsk.filter((t)=>t.status!=="completed"&&t.priority==="Alta")
    const today = new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})
    const overdueRows = overdue.map((t)=>{
      const p=proj.find((x)=>x.id===t.project_id)
      const days=Math.ceil((new Date().getTime()-new Date(t.due_date).getTime())/86400000)
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #fecaca">${t.title}<br><small style="color:#888">${p?.name||""}</small></td><td style="padding:8px 12px;border-bottom:1px solid #fecaca;color:#ef4444;font-weight:600">${days} dias atraso</td></tr>`
    }).join("")
    const projRows = proj.map((p)=>{
      const pt=tsk.filter((t)=>t.project_id===p.id); if(!pt.length) return ""
      const rows=pt.map((t)=>`<tr><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;${t.status==="completed"?"text-decoration:line-through;color:#999":""}">${t.title}</td><td style="padding:6px 12px;border-bottom:1px solid #f0f0f0"><span style="background:${t.priority==="Alta"?"#fee2e2;color:#ef4444":"#fef9c3;color:#ca8a04"};padding:2px 8px;border-radius:12px;font-size:11px">${t.priority}</span></td></tr>`).join("")
      return `<tr><td colspan="2" style="padding:10px 12px;background:#f8f8f8;font-weight:700">${p.name}</td></tr>${rows}`
    }).join("")
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,sans-serif;max-width:700px;margin:0 auto;padding:20px">
<h1 style="font-size:22px;font-weight:700;margin-bottom:4px">Rumo</h1>
<p style="color:#666;font-size:14px;margin-bottom:24px">${today}</p>
<table style="width:100%;border-collapse:collapse;margin-bottom:28px"><tr>
<td style="background:#f8f8f8;border-radius:8px;padding:16px;text-align:center"><div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase">Conclusao</div><div style="font-size:28px;font-weight:700;color:#f59e0b">${rate}%</div></td>
<td style="width:12px"></td>
<td style="background:#f8f8f8;border-radius:8px;padding:16px;text-align:center"><div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase">Alta Prioridade</div><div style="font-size:28px;font-weight:700;color:#ef4444">${alta.length}</div></td>
<td style="width:12px"></td>
<td style="background:#f8f8f8;border-radius:8px;padding:16px;text-align:center"><div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase">Atrasadas</div><div style="font-size:28px;font-weight:700;color:#ef4444">${overdue.length}</div></td>
<td style="width:12px"></td>
<td style="background:#f8f8f8;border-radius:8px;padding:16px;text-align:center"><div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase">Projetos</div><div style="font-size:28px;font-weight:700;color:#3b82f6">${proj.length}</div></td>
</tr></table>
${overdue.length>0?`<h2 style="font-size:16px;font-weight:700;margin:0 0 12px">Tarefas Atrasadas</h2><table style="width:100%;border-collapse:collapse;background:#fff5f5;border-radius:8px;margin-bottom:24px">${overdueRows}</table>`:""}
<h2 style="font-size:16px;font-weight:700;margin:0 0 12px">Por Projeto</h2>
<table style="width:100%;border-collapse:collapse">${projRows}</table>
</body></html>`
    const key = process.env.RESEND_API_KEY
    if (!key||key==="sua_chave_aqui") return NextResponse.json({error:"Configure RESEND_API_KEY no Vercel."},{status:500})
    const res = await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
      body:JSON.stringify({from:"Rumo <onboarding@resend.dev>",to:["fabiocarvalhooo@gmail.com","f.santoscarvalho@icloud.com"],subject:`Rumo — Relatorio Semanal — ${today}`,html})
    })
    if (!res.ok) { const e=await res.json(); return NextResponse.json({error:e.message},{status:500}) }
    return NextResponse.json({ok:true})
  } catch(e) {
    return NextResponse.json({error:String(e)},{status:500})
  }
}
