/** Never forward raw upstream errors — may contain echoes of prompts; never log secrets. */

const RATE_HINT = /rate|429|RESOURCE_EXHAUSTED|quota/i
const AUTH_HINT = /401|403|Unauthorized|Forbidden|incorrect api key|invalid api key/i
const NETWORK_HINT = /fetch|ENOTFOUND|ECONNRESET|NETWORK|timed out/i

export function sanitizeChatError(status: number, message: string): string {
  if (status === 401 || status === 403 || AUTH_HINT.test(message)) {
    return 'Authentication failed — check your API key for the selected provider.'
  }
  if (status === 429 || RATE_HINT.test(message)) {
    return 'Rate limit reached — wait a moment or reduce throughput.'
  }
  if (status >= 502 && status <= 504) {
    return 'The AI provider appears temporarily unreachable. Try again shortly.'
  }
  if (NETWORK_HINT.test(message)) {
    return 'Network error — check your connection and try again.'
  }
  return 'The AI request failed. Confirm the provider, model slug, and your key scopes.'
}
