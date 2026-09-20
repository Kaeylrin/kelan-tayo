import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function cleanMassiveRooms() {
  console.log("Fetching remaining spam rooms...");
  let totalRoomsDeleted = 0;
  
  while (true) {
    const { data: rooms } = await supabase.from('rooms')
      .select('id')
      .eq('name', 'Hello Wrenier Carillo')
      .limit(5); // Fetch smaller batches of rooms
      
    if (!rooms || rooms.length === 0) break;
    
    for (const room of rooms) {
      console.log(`Processing room ${room.id}...`);
      
      // Aggressive chunking for member deletion!
      let membersDeleted = 0;
      while (true) {
        const { data: members } = await supabase.from('members')
          .select('id')
          .eq('room_id', room.id)
          .limit(200); // Only grab 200 members at a time to guarantee no timeouts
          
        if (!members || members.length === 0) break;
        
        const ids = members.map(m => m.id);
        const { error } = await supabase.from('members').delete().in('id', ids);
        
        if (error) {
          console.log(`Error chunk-deleting members in room ${room.id}:`, error);
          break; // Break the inner loop if it still fails, though it shouldn't at 200
        }
        membersDeleted += ids.length;
        console.log(`  ...deleted ${membersDeleted} members from room ${room.id} so far`);
      }
      
      // Now that all members are safely chunk-deleted, the room delete will succeed instantly
      const { error: roomError } = await supabase.from('rooms').delete().eq('id', room.id);
      if (roomError) {
        console.log(`Error deleting room ${room.id}:`, roomError);
      } else {
        totalRoomsDeleted++;
        console.log(`Successfully deleted room ${room.id}. Total rooms deleted this run: ${totalRoomsDeleted}`);
      }
    }
  }
  console.log("Completely finished sweeping all remaining spam!");
}

cleanMassiveRooms();
