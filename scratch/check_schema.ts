
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
  const { data, error } = await supabase.from('turnos').select('*').limit(1)
  if (error) {
    console.error('Error fetching turnos:', error)
    return
  }
  if (data && data.length > 0) {
    console.log('Columns in turnos:', Object.keys(data[0]))
  } else {
    console.log('No data in turnos, trying to get schema via RPC or just assuming it doesnt exist')
    // If no data, we can't easily see columns with select *
  }
}

checkColumns()
