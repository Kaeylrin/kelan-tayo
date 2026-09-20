import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function test() {
  console.log("Deleting a spam room to test cascade...")
  const { data: room, error } = await supabase.from('rooms').select('id').eq('name', 'Hello Wrenier Carillo').limit(1).single()
  if (room) {
    console.log("Found room:", room.id)
    const { count: membersBefore } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('room_id', room.id)
    console.log("Members before:", membersBefore)
    await supabase.from('rooms').delete().eq('id', room.id)
    const { count: membersAfter } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('room_id', room.id)
    console.log("Members after:", membersAfter)
  }
}
test()
