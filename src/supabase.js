import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ygiqcxeyxxrpdyyfqcca.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnaXFjeGV5eHhycGR5eWZxY2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NzA0NDEsImV4cCI6MjA5NjI0NjQ0MX0.x-H3lytpNisCRP_GCiL28WbYjHadszUSrATsCgA31gA'

export const supabase = createClient(supabaseUrl, supabaseKey)
