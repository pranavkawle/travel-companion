// Get environment variables (safe for build-time)
const getEnvVars = () => {
  return {
    domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '',
    clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '',
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
  };
};

const envVars = getEnvVars();

// Only validate in browser (not during build)
if (typeof window !== 'undefined') {
  const missing = [];
  if (!envVars.domain) missing.push('NEXT_PUBLIC_AUTH0_DOMAIN');
  if (!envVars.clientId) missing.push('NEXT_PUBLIC_AUTH0_CLIENT_ID');

  if (missing.length > 0) {
    console.error('Missing required Auth0 environment variables:', missing.join(', '));
    console.error('Current env vars:', {
      domain: envVars.domain ? '✓ Set' : '✗ Missing',
      clientId: envVars.clientId ? '✓ Set' : '✗ Missing',
      audience: envVars.audience ? '✓ Set' : '✗ Not set (optional)',
    });
  }
}

export const auth0Config = {
  domain: envVars.domain,
  clientId: envVars.clientId,
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' 
      ? `${window.location.origin}/callback` 
      : 'http://localhost:3000/callback',
    audience: envVars.audience,
    scope: 'openid profile email'
  },
  cacheLocation: 'memory' as const,
  useRefreshTokens: true,
};

// Export helper to check if Auth0 is properly configured
export const isAuth0Configured = () => {
  return !!(auth0Config.domain && auth0Config.clientId);
};