import { createClient } from "@supabase/supabase-js"
const supabase = createClient("https://bdcmaxqnieqodjlgaobd.supabase.co", "sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ")
async function check() {
  const { count, error } = await supabase.from("rooms").select("*", { count: 'exact', head: true }).eq("name", "60.347113, 120.080800");
  console.log("Remaining spam rooms:", count);
}
check();
