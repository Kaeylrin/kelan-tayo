import { createClient } from "@supabase/supabase-js"
const supabase = createClient("https://bdcmaxqnieqodjlgaobd.supabase.co", "sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ")
async function check() {
  const { data: rooms } = await supabase.from("rooms").select("id").eq("name", "60.347113, 120.080800").limit(1);
  if (rooms.length > 0) {
    const { count } = await supabase.from("members").select("*", { count: 'exact', head: true }).eq("room_id", rooms[0].id);
    console.log("Members in this room:", count);
  }
}
check();
