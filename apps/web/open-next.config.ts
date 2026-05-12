import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Using defineCloudflareConfig() — the recommended API in OpenNext >=1.19.9.
 *
 * The manual OpenNextConfig object we had before was missing the critical
 * `cloudflare: { useWorkerdCondition: true }` field introduced in 1.19.9.
 * Without it, the bundler resolves imports with Node.js conditions instead
 * of the "workerd" condition, producing a Worker that crashes on every
 * dynamic route at runtime (even though the build succeeds).
 *
 * defineCloudflareConfig() sets all required defaults automatically.
 */
export default defineCloudflareConfig();
