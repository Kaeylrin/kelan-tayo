import { createClient } from "@supabase/supabase-js"
const supabase = createClient("https://bdcmaxqnieqodjlgaobd.supabase.co", "sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ")

async function cleanMassiveRooms() {
  console.log("Fetching remaining spam rooms...");
  let totalRoomsDeleted = 0;
  
  while (true) {
    const { data: rooms } = await supabase.from("rooms")
      .select("id")
      .eq("name", "60.347113, 120.080800")
      .limit(100);
      
    if (!rooms || rooms.length === 0) break;
    
    for (const room of rooms) {
      let membersDeleted = 0;
      while (true) {
        const { data: members } = await supabase.from("members")
          .select("id")
          .eq("room_id", room.id)
          .limit(200);
          
        if (!members || members.length === 0) break;
        
        const ids = members.map(m => m.id);
        const { error } = await supabase.from("members").delete().in("id", ids);
        
        if (error) break;
        membersDeleted += ids.length;
      }
      
      const { error: roomError } = await supabase.from("rooms").delete().eq("id", room.id);
      if (!roomError) {
        totalRoomsDeleted++;
        if (totalRoomsDeleted % 50 === 0) console.log(`Deleted ${totalRoomsDeleted} rooms...`);
      }
    }
  }
  console.log("Finished!");
}
cleanMassiveRooms();
