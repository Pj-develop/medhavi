import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchPatientData() {
  const { data, error } = await supabase.from("patient").select("*");

  if (error) console.error("Error fetching patient data:", error);
  else console.log("Patient Data:", data);
}

fetchPatientData();
