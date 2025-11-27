import { serve } from "bun";
import index from "./index.html";
import { GET as getFacilities } from "./app/api/facilities/route";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes (SPA fallback)
    "/*": index,

    // API Routes
    "/api/facilities": {
      async GET(req) {
        return getFacilities(req);
      }
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
    },

    "/api/admin/seed": {
      async POST(req) {
        try {
          console.log("Starting seed process...");
          const proc = Bun.spawn(["bun", "run", "src/db/seed.ts"], {
            stdout: "pipe",
            stderr: "pipe",
          });

          const text = await new Response(proc.stdout).text();
          const err = await new Response(proc.stderr).text();
          await proc.exited;

          console.log("Seed process exited with code:", proc.exitCode);

          return Response.json({
            output: text,
            error: err,
            exitCode: proc.exitCode
          });
        } catch (e) {
          return Response.json({ error: String(e), exitCode: -1 }, { status: 500 });
        }
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
