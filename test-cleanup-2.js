import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function cleanRemaining() {
  console.log("Fetching spam rooms...");
  let offset = 0;
  let totalRoomsDeleted = 0;
  
  while (true) {
    const { data: rooms } = await supabase.from('rooms')
      .select('id')
      .eq('name', 'Hello Wrenier Carillo')
      .limit(50);
      
    if (!rooms || rooms.length === 0) break;
    
    for (const room of rooms) {
      // Delete members for this room first to prevent cascade timeout
      await supabase.from('members').delete().eq('room_id', room.id);
      
      // Then delete the room
      const { error } = await supabase.from('rooms').delete().eq('id', room.id);
      if (error) {
        console.log("Error deleting room:", error);
      } else {
        totalRoomsDeleted++;
      }
    }
    console.log(`Deleted ${totalRoomsDeleted} rooms (and their members)...`);
  }
  console.log("Completely finished!");
}

cleanRemaining();
