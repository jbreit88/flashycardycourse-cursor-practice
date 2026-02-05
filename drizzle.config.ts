import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local so drizzle-kit has DATABASE_URL when run from CLI
config({ path: ".env.local" });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
