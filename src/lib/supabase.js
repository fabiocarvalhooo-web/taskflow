import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://diziserualtfkupwyvhq.supabase.co'
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpemlzZXJ1YWx0Zmt1cHd5dmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDg3ODUsImV4cCI6MjA5NjY4NDc4NX0.ed72vBvSbosGyBl_jNpebWxR8cBfC6NDjZLaFS_R32E"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
