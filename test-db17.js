import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function test() {
  const { data } = await supabase.from('rooms').select('*').eq('id', 'f291c95d-33fb-406f-80b2-1c48380cbe79')
  console.log(data)
}
test()
