import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function test() {
  const { data } = await supabase.from('rooms').select('name').order('created_at', { ascending: false }).limit(20)
  console.log(data)
}
test()
