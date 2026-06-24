import dotenv from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

dotenv.config();
dotenv.config({ path: resolve(process.cwd(), "apps/backend/.env") });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  OMDB_API_KEY: z.string().min(1, "OMDB_API_KEY is required"),
  NODE_ENV: z.string().default("development")
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  OMDB_API_KEY: process.env.OMDB_API_KEY,
  NODE_ENV: process.env.NODE_ENV
});
