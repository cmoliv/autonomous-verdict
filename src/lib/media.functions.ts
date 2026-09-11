import { createServerFn } from "@tanstack/react-start";
import { readdirSync, existsSync } from "fs";
import { join } from "path";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMediaFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const publicPath = join(process.cwd(), "public", "media");
    
    const evidencePath = join(publicPath, "evidence");
    const witnessesPath = join(publicPath, "witnesses");

    const getFiles = (dir: string, prefix: string) => {
      try {
        if (!existsSync(dir)) return [];
        return readdirSync(dir, { withFileTypes: true })
          .filter(dirent => dirent.isFile() && !dirent.name.startsWith("."))
          .map(dirent => `/media/${prefix}/${dirent.name}`);
      } catch (e) {
        console.error(`Error reading directory ${dir}:`, e);
        return [];
      }
    };

    return {
      evidence: getFiles(evidencePath, "evidence"),
      witnesses: getFiles(witnessesPath, "witnesses"),
    };
  });
