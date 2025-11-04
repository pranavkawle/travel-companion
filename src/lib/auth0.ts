// Validate environment variables at module load time
const validateEnvVars = () => {
  const requiredVars = {
    NEXT_PUBLIC_AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
    NEXT_PUBLIC_AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('Missing required Auth0 environment variables:', missing.join(', '));
    console.error('Current env vars:', {
      domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN ? '✓ Set' : '✗ Missing',
      clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ? '✓ Set' : '✗ Missing',
      audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE ? '✓ Set' : '✗ Not set (optional)',
    });
    
    // In production, this should fail hard
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required Auth0 environment variables: ${missing.join(', ')}`);
    }
  }

  return requiredVars;
};

// Validate on module load
const envVars = validateEnvVars();

export const auth0Config = {
  domain: envVars.NEXT_PUBLIC_AUTH0_DOMAIN || '',
  clientId: envVars.NEXT_PUBLIC_AUTH0_CLIENT_ID || '',
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' 
      ? `${window.location.origin}/callback` 
      : 'http://localhost:3000/callback',
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
    scope: 'openid profile email'
  },
  cacheLocation: 'memory' as const,
  useRefreshTokens: true,
};

// Export helper to check if Auth0 is properly configured
export const isAuth0Configured = () => {
  return !!(auth0Config.domain && auth0Config.clientId);
};