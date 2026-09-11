import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envStr = readFileSync(".env", "utf-8");
const env = {};
envStr.split("\n").forEach(line => {
  const [k, ...v] = line.split("=");
  if (k) {
    let val = v.join("=").trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[k.trim()] = val;
  }
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);
async function run() {
  const { data, error } = await supabase.from("witnesses").select("name, video_path");
  console.log("Witnesses:", JSON.stringify(data, null, 2));
  if (error) console.error("Error:", error);
}
run();
