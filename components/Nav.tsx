"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
export default function Nav() {
  const path = usePathname()
  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/projetos', label: 'Projetos' },
    { href: '/atas', label: 'Atas' },
    { href: '/fechamento', label: 'Fechamento de Sexta' },
  ]
  return (
    <nav className="nav">
      <div className="nav-inner">
        <span style={{fontWeight:700,fontSize:15}}>Rumo</span>
        <div className="nav-links">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={"nav-link" + (path===l.href?" active":"")}>{l.label}</Link>
          ))}
        </div>
      </div>
    </nav>
  )
}