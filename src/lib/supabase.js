import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://diziserualtfkupwyvhq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpemlaZXJ1YWx0Zmt1cHd5dmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0MjI2OTUsImV4cCI6MjA2MDA4MjY5NX0.ed72vBvSbosGyBl_jNpebWxR8cBfC6NDjZLaFS_R32E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
