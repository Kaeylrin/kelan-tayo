import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function test() {
  const { data } = await supabase.from('members').select('display_name').limit(1000)
  
  const counts = {}
  for (const row of data) {
    counts[row.display_name] = (counts[row.display_name] || 0) + 1
  }
  console.log(counts)
}
test()
