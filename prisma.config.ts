import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://ropacolor:ropacolor2024@localhost:5432/ropacolor",
  },
});
