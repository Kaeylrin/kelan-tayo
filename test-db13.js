import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function test() {
  const { count } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('display_name', '?????????')
  console.log('Spam members 2:', count)
}
test()
