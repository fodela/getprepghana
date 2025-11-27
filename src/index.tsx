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
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
