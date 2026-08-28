#!/usr/bin/env node

/**
 * Environment validation script
 * Run this before starting the development server to ensure all required env vars are set
 */

const { z } = require('zod');

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters for security"),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

try {
  envSchema.parse(process.env);
  console.log("✅ Environment variables validated successfully!");
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment variable validation failed:\n");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    console.error("\n⚠️  Please check your .env file and ensure all required variables are set.");
    console.error("📄 See .env.example for reference.\n");
    process.exit(1);
  }
  throw error;
}

