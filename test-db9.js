import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://bdcmaxqnieqodjlgaobd.supabase.co', 'sb_publishable_lfsZSpg_6H3oMjVLUb_UnA__4vfkdLQ')

async function test() {
  const { data, error } = await supabase.from('members').delete().eq('id', '39aab183-3b8c-437e-9ff0-3a9425bffee0')
  console.log('Error:', error)
  console.log('Data:', data)
}
test()
