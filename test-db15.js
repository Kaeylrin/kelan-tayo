import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function test() {
  const { data: member } = await supabase.from('members').select('room_id').eq('display_name', 'WRENIER CARILLO_').limit(1).single()
  if (member) {
    console.log("Found room with spam members:", member.room_id)
    const { count: membersBefore } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('room_id', member.room_id)
    console.log("Members before:", membersBefore)
    const { error } = await supabase.from('rooms').delete().eq('id', member.room_id)
    console.log("Room delete error:", error)
    const { count: membersAfter } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('room_id', member.room_id)
    console.log("Members after:", membersAfter)
  }
}
test()
