import { createClient } from '@supabase/supabase-js'

const url = 'https://bdcmaxqnieqodjlgaobd.supabase.co'
const key = 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ'

const supabase = createClient(url, key)

async function test() {
  const { count: members } = await supabase.from('members').select('*', { count: 'exact', head: true })
  console.log('Real members count:', members)
}
test()
