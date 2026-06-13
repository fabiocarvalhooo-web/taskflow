"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit() {
    setLoading(true); setError("")
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else { alert("Conta criada! Verifique seu email."); setIsSignUp(false) }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError("Email ou senha incorretos.")
      else router.push("/")
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:"100vh",background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:12,padding:32,width:"100%",maxWidth:400,boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
        <h1 style={{fontSize:22,fontWeight:700,marginBottom:4,fontFamily:"-apple-system,sans-serif"}}>Agenda de Trabalho</h1>
        <p style={{color:"#6b7280",fontSize:14,marginBottom:28,fontFamily:"-apple-system,sans-serif"}}>{isSignUp ? "Criar nova conta" : "Entrar na sua conta"}</p>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} style={{padding:"10px 14px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:14,outline:"none",fontFamily:"-apple-system,sans-serif"}}/>
          <input type="password" placeholder="Senha (minimo 6 caracteres)" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} style={{padding:"10px 14px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:14,outline:"none",fontFamily:"-apple-system,sans-serif"}}/>
          {error && <div style={{color:"#ef4444",fontSize:13,background:"#fef2f2",padding:"8px 12px",borderRadius:6}}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{background:"#3b82f6",color:"white",border:"none",borderRadius:8,padding:"11px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"-apple-system,sans-serif"}}>
            {loading ? "Aguarde..." : (isSignUp ? "Criar Conta" : "Entrar")}
          </button>
          <button onClick={()=>{setIsSignUp(!isSignUp);setError("")}} style={{background:"none",border:"none",color:"#6b7280",fontSize:13,cursor:"pointer",marginTop:4,fontFamily:"-apple-system,sans-serif"}}>
            {isSignUp ? "Ja tem conta? Entrar" : "Nao tem conta? Criar agora"}
          </button>
        </div>
      </div>
    </div>
  )
}
