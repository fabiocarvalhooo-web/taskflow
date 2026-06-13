import type { Metadata } from "next"
import "./globals.css"
export const metadata: Metadata = {
  title: "Rumo",
  description: "Gestao de projetos e tarefas",
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
