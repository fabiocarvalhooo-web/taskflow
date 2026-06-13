"use client"
import { useEffect } from "react"
export default function Toast({ message, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  return <div className={"toast "+type}>{message}</div>
}