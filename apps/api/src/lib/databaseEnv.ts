const DATABASE_URL_CANDIDATES = [
  'DATABASE_URL',
  'NETLIFY_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
  'NEON_DATABASE_URL',
] as const;

type DatabaseEnvSource = (typeof DATABASE_URL_CANDIDATES)[number];

export type DatabaseEnvResult = {
  url?: string;
  source?: DatabaseEnvSource;
  assigned: boolean;
};

function readEnvValue(env: NodeJS.ProcessEnv, key: DatabaseEnvSource): string | undefined {
  const value = env[key]?.trim();
  return value || undefined;
}

export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): DatabaseEnvResult {
  for (const key of DATABASE_URL_CANDIDATES) {
    const value = readEnvValue(env, key);
    if (value) {
      return {
        url: value,
        source: key,
        assigned: key === 'DATABASE_URL',
      };
    }
  }

  return { assigned: false };
}

export function configureDatabaseUrl(env: NodeJS.ProcessEnv = process.env): DatabaseEnvResult {
  const resolved = resolveDatabaseUrl(env);

  if (resolved.url && !readEnvValue(env, 'DATABASE_URL')) {
    env.DATABASE_URL = resolved.url;
    return { ...resolved, assigned: true };
  }

  return resolved;
}

export function databaseUrlSourceLabel(result = resolveDatabaseUrl()): string {
  if (!result.url || !result.source) {
    return 'not configured';
  }

  return result.source === 'DATABASE_URL'
    ? 'DATABASE_URL'
    : `DATABASE_URL via ${result.source}`;
}
