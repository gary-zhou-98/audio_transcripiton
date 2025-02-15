export const config = {
  deepgramApiKey: process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY,
} as const;

// Validate environment variables
Object.entries(config).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});
