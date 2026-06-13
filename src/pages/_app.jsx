import '../styles/globals.css'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '../lib/supabase'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}
