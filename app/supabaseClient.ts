import { createClient } from '@supabase/supabase-js';

// TU URL REAL (Ya la puse yo desde tu imagen)
const supabaseUrl = 'https://buwkftolizvjkmlkszlg.supabase.co';

// TU CLAVE PÚBLICA (Cópiala de tu panel de Supabase -> Project Settings -> API Keys)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1d2tmdG9saXp2amttbGtzemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzIwMDksImV4cCI6MjA4NTY0ODAwOX0.LfmwhD3nv0peH4ttUx5GrjtUtHSrD8U06UGw44lMcJY';

export const supabase = createClient(supabaseUrl, supabaseKey);