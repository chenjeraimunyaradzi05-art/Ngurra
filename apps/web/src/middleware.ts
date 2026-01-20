/**
 * Deprecated middleware entrypoint.
 *
 * Next.js now prefers the `proxy` file convention. Keep this file as a thin
 * forwarder to avoid duplicate logic while preserving compatibility.
 */

export { middleware, config } from './proxy';
