export const config = {
  deepgramApiKey: process.env.DEEPGRAM_API_KEY,
} as const;

// Validate environment variables
Object.entries(config).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});
