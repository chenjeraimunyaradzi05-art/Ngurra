const DATABASE_URL_CANDIDATES = [
  'DATABASE_URL',
  'NETLIFY_DATABASE_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
  'NEON_DATABASE_URL',
];

function readEnvValue(env, key) {
  const value = env[key] && String(env[key]).trim();
  return value || undefined;
}

function resolveDatabaseUrl(env = process.env) {
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

function configureDatabaseUrl(env = process.env) {
  const resolved = resolveDatabaseUrl(env);

  if (resolved.url && !readEnvValue(env, 'DATABASE_URL')) {
    env.DATABASE_URL = resolved.url;
    return { ...resolved, assigned: true };
  }

  return resolved;
}

function databaseUrlSourceLabel(result = resolveDatabaseUrl()) {
  if (!result.url || !result.source) {
    return 'not configured';
  }

  return result.source === 'DATABASE_URL'
    ? 'DATABASE_URL'
    : `DATABASE_URL via ${result.source}`;
}

module.exports = {
  configureDatabaseUrl,
  databaseUrlSourceLabel,
  resolveDatabaseUrl,
};
