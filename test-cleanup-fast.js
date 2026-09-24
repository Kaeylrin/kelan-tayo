import { createClient } from "@supabase/supabase-js"
const supabase = createClient("https://bdcmaxqnieqodjlgaobd.supabase.co", "sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ")

async function fastCleanup() {
  console.log("Starting FAST bulk cleanup...");
  let totalDeleted = 0;
  
  while (true) {
    const { data: rooms } = await supabase.from("rooms")
      .select("id")
      .eq("name", "60.347113, 120.080800")
      .limit(500);
      
    if (!rooms || rooms.length === 0) break;
    
    const ids = rooms.map(r => r.id);
    const { error } = await supabase.from("rooms").delete().in("id", ids);
    
    if (error) {
       console.error("Error bulk deleting rooms:", error);
       // If there's an error (e.g. timeout due to too many members), fall back to smaller batch
       const half = ids.slice(0, 10);
       await supabase.from("rooms").delete().in("id", half);
       totalDeleted += half.length;
    } else {
       totalDeleted += ids.length;
       console.log(`FAST Deleted ${totalDeleted} rooms...`);
    }
  }
  console.log("FAST Cleanup completely finished!");
}
fastCleanup();
