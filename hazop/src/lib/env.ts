import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  
  // JWT & Auth
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters for security"),
  
  // Email (optional for now, but should be set in production)
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // Node environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  
  // Next.js
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment variable validation failed:\n");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      console.error("\n⚠️  Please check your .env file and ensure all required variables are set.\n");
      process.exit(1);
    }
    throw error;
  }
}

export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
