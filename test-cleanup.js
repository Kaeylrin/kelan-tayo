import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function cleanDatabase() {
  console.log("Starting cleanup of members...")
  let membersDeleted = 0;
  while (true) {
    const { data: members } = await supabase.from('members')
      .select('id')
      .in('display_name', ['WRENIER CARILLO_', '?????????'])
      .limit(200);
      
    if (!members || members.length === 0) break;
    
    const ids = members.map(m => m.id);
    const { error } = await supabase.from('members').delete().in('id', ids);
    if (error) {
      console.log("Error deleting members:", error);
      break;
    }
    membersDeleted += ids.length;
    console.log(`Deleted ${membersDeleted} members so far...`);
  }
  console.log("Finished deleting members.")

  console.log("Starting cleanup of rooms...")
  let roomsDeleted = 0;
  while (true) {
    const { data: rooms } = await supabase.from('rooms')
      .select('id')
      .eq('name', 'Hello Wrenier Carillo')
      .limit(200);
      
    if (!rooms || rooms.length === 0) break;
    
    const ids = rooms.map(r => r.id);
    const { error } = await supabase.from('rooms').delete().in('id', ids);
    if (error) {
      console.log("Error deleting rooms:", error);
      break;
    }
    roomsDeleted += ids.length;
    console.log(`Deleted ${roomsDeleted} rooms so far...`);
  }
  console.log("Finished deleting rooms. Database clean!")
}

cleanDatabase()
