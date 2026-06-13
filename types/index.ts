export interface Project {
  id: string
  name: string
  description?: string
  color?: string
  area?: string
  visibility?: string
  owner_id?: string
  created_at: string
  updated_at: string
  tasks?: Task[]
}
export interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  status: 'pending' | 'completed'
  priority: 'Alta' | 'Media' | 'Baixa'
  due_date?: string
  responsible_name?: string
  responsible_email?: string
  note?: string
  final_decision?: string
  created_at: string
  updated_at: string
}
export interface Minute {
  id: string
  project_id: string
  title: string
  created_at: string
  updated_at: string
  items?: MinuteItem[]
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