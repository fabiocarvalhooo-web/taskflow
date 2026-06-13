"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Nav() {
  const path = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return }
      setEmail(user.email || "")
    })
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/projetos", label: "Projetos" },
    { href: "/atas", label: "Atas" },
    { href: "/fechamento", label: "Fechamento" },
  ]

  return (
    <nav className="nav">
      <div className="nav-inner">
        <span style={{fontWeight:700,fontSize:16}}>Rumo</span>
        <div className="nav-links">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={"nav-link"+(path===l.href?" active":"")}>{l.label}</Link>
          ))}
        </div>
        <div className="nav-user">
          <span>{email}</span>
          <button onClick={logout} className="btn-secondary" style={{padding:"5px 12px",fontSize:12}}>Sair</button>
        </div>
      </div>
    </nav>
  )
}