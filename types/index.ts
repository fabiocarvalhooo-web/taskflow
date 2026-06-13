export interface Project {
  id: string
  name: string
  description?: string
  color?: string
  area?: string
  owner_id?: string
  created_at: string
  updated_at: string
}
export interface Task {
  id: string
  project_id: string
  title: string
  status: string
  priority: string
  due_date?: string
  responsible_name?: string
  responsible_email?: string
  note?: string
  final_decision?: string
  created_by?: string
  created_at: string
  updated_at: string
}
export interface Minute {
  id: string
  project_id: string
  title: string
  created_at: string
  updated_at: string
}
export interface MinuteItem {
  id: string
  minute_id: string
  tema: string
  deliberacoes?: string
  responsavel?: string
  prazo?: string
  observacao?: string
  created_at: string
}
