"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [msg, setMsg] = useState("")

  async function handleSubmit() {
    if (!email || !password) { setError("Preencha email e senha."); return }
    setLoading(true); setError(""); setMsg("")
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMsg("Conta criada! Verifique seu email e volte para fazer login.")
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError("Email ou senha incorretos.")
      else if (data.session) window.location.href = "/"
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:"100vh",background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"-apple-system,sans-serif"}}>
      <div style={{background:"white",borderRadius:12,padding:32,width:"100%",maxWidth:400,boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
        <h1 style={{fontSize:22,fontWeight:700,marginBottom:4}}>Agenda de Trabalho</h1>
        <p style={{color:"#6b7280",fontSize:14,marginBottom:28}}>{isSignUp?"Criar nova conta":"Entrar na sua conta"}</p>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:"10px 14px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:14,outline:"none"}}/>
          <input type="password" placeholder="Senha (minimo 6 caracteres)" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} style={{padding:"10px 14px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:14,outline:"none"}}/>
          {error && <div style={{color:"#ef4444",fontSize:13,background:"#fef2f2",padding:"8px 12px",borderRadius:6}}>{error}</div>}
          {msg && <div style={{color:"#16a34a",fontSize:13,background:"#f0fdf4",padding:"8px 12px",borderRadius:6}}>{msg}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{background:"#3b82f6",color:"white",border:"none",borderRadius:8,padding:11,fontSize:14,fontWeight:600,cursor:"pointer"}}>
            {loading?"Aguarde...":(isSignUp?"Criar Conta":"Entrar")}
          </button>
          <button onClick={()=>{setIsSignUp(!isSignUp);setError("");setMsg("")}} style={{background:"none",border:"none",color:"#6b7280",fontSize:13,cursor:"pointer"}}>
            {isSignUp?"Ja tem conta? Entrar":"Nao tem conta? Criar agora"}
          </button>
        </div>
      </div>
    </div>
  )
}
