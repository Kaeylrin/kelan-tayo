import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function test() {
  const { data } = await supabase.from('members').select('*').order('joined_at', { ascending: false }).limit(5)
  console.log(data)
}
test()
