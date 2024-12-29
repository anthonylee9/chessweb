import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bppjynjlsjwjnkddhjzi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwcGp5bmpsc2p3am5rZGRoanppIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgwMTA2NzcsImV4cCI6MjAxMzU4NjY3N30.yRx5eo3irb_6zAi-uaopnBq6cc-6ZhAWkkusEJr9fIo'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase