import { createClient } from '@supabase/supabase-js'

const url = 'https://bdcmaxqnieqodjlgaobd.supabase.co'
const key = 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ'

const supabase = createClient(url, key)

async function test() {
  const { count: rooms } = await supabase.from('rooms').select('*', { count: 'exact', head: true })
  const { count: members } = await supabase.from('room_members').select('*', { count: 'exact', head: true })
  console.log('Real rooms count:', rooms)
  console.log('Real members count:', members)
}
test()
