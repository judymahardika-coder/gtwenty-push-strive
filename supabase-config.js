const SUPABASE_URL = "https://otnknjixceezhvqfpgzz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_4Yvv00MsO5tYitGaX1y6tw_yV6BX-vx";

window.gpsSupabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
