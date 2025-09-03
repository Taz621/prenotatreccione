// config.js
// NON usare process.env qui per un deploy semplice su Netlify
const SUPABASE_URL = 'https://mdyjpcjmfthjylaoxapc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keWpwY2ptZnRoanlsYW94YXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDk3MTUsImV4cCI6MjA3MjQ4NTcxNX0.je-dVMivgrPtRAwFnZRzb2hLmD1hWYV_PF1bbaasFZ4';

// Esporta il client Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;