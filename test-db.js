import { createClient } from '@supabase/supabase-js'
const supabase = createClient('', '')
async function test() {
  const { count: rooms } = await supabase.from('rooms').select('*', { count: 'exact', head: true })
  const { count: members } = await supabase.from('room_members').select('*', { count: 'exact', head: true })
  console.log('Real rooms count:', rooms)
  console.log('Real members count:', members)
}
test()
