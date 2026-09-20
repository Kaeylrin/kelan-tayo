import { createClient } from '@supabase/supabase-js'

const url = 'https://bdcmaxqnieqodjlgaobd.supabase.co'
const key = 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ'

const supabase = createClient(url, key)

async function test() {
  const { data } = await supabase.rpc('get_public_stats')
  console.log('RPC returned:', data)
}
test()
