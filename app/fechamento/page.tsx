"use client"
import { useState } from "react"
import Nav from "@/components/Nav"

export default function FechamentoPage() {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const today = new Date()
  const isFriday = today.getDay() === 5

  async function send() {
    setSending(true); setError("")
    try {
      const res = await fetch("/api/send-email", { method:"POST" })
      if (res.ok) setSent(true)
      else { const d = await res.json(); setError(d.error||"Erro ao enviar.") }
    } catch { setError("Erro de conexao.") }
    setSending(false)
  }

  return (
    <>
      <Nav />
      <div className="page-wrapper">
        <div className="header">
          <div>
            <h1>Fechamento de Sexta</h1>
            <div className="date">{today.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
        </div>
        <div className="fechamento-card">
          {sent ? (
            <>
              <div style={{fontSize:48,marginBottom:16}}>✅</div>
              <h2>Relatorio Enviado!</h2>
              <p>Enviado para fabiocarvalhooo@gmail.com e f.santoscarvalho@icloud.com</p>
              <button className="btn-secondary" style={{marginTop:20}} onClick={()=>setSent(false)}>Enviar novamente</button>
            </>
          ) : (
            <>
              <div style={{fontSize:48,marginBottom:16}}>📧</div>
              <h2>Relatorio Semanal</h2>
              <p>Envia resumo para <strong>fabiocarvalhooo@gmail.com</strong> e <strong>f.santoscarvalho@icloud.com</strong></p>
              {!isFriday && <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"10px 16px",fontSize:13,color:"#92400e",margin:"16px 0"}}>Hoje nao e sexta-feira, mas voce pode enviar assim mesmo.</div>}
              {error && <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 16px",fontSize:13,color:"#ef4444",margin:"16px 0"}}>{error}</div>}
              <button className="btn-primary" style={{marginTop:8}} onClick={send} disabled={sending}>{sending?"Enviando...":"📧 Enviar Relatorio Agora"}</button>
            </>
          )}
        </div>
        <div style={{maxWidth:500,margin:"0 auto",padding:16,background:"white",borderRadius:10,fontSize:13,color:"#6b7280"}}>
          <strong style={{color:"#111"}}>O relatorio inclui:</strong>
          <ul style={{marginTop:8,paddingLeft:20,lineHeight:2}}>
            <li>Taxa de conclusao geral</li>
            <li>Tarefas de alta prioridade</li>
            <li>Tarefas atrasadas com dias de atraso</li>
            <li>Resumo por projeto</li>
          </ul>
        </div>
      </div>
    </>
  )
}
