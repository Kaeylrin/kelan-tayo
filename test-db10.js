import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function test() {
  const { count } = await supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('name', 'Hello Wrenier Carillo')
  console.log('Spam rooms:', count)
}
test()
