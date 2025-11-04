# Azure Static Web Apps Deployment Guide

## Environment Variables Configuration

### Problem
Next.js applications with static export (`output: 'export'`) require all `NEXT_PUBLIC_*` environment variables to be available **at build time**, not runtime. These variables are baked into the JavaScript bundle during the build process.

### Solution
Environment variables must be configured in **two locations**:

### 1. GitHub Secrets (for CI/CD Build)

Configure these secrets in your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

**Required Secrets:**
- `NEXT_PUBLIC_AUTH0_DOMAIN` - Your Auth0 domain (e.g., `your-tenant.auth0.com`)
- `NEXT_PUBLIC_AUTH0_CLIENT_ID` - Your Auth0 application client ID
- `NEXT_PUBLIC_AUTH0_AUDIENCE` - Your Auth0 API audience (optional)
- `DATABASE_URL` - Azure SQL Server connection string
- `SHADOW_DATABASE_URL` - Shadow database for Prisma migrations
- `AUTH0_CLIENT_SECRET` - Auth0 client secret (for server-side operations)
- `AZURE_STATIC_WEB_APPS_API_TOKEN_KIND_ISLAND_0755F0900` - Azure deployment token

**Optional Variables (configure as Repository Variables):**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics measurement ID
- `NODE_ENV` - Environment name (production/staging/development)

### 2. Azure Static Web Apps Configuration (for Runtime)

While static exports don't use runtime environment variables, configure them in Azure Portal for consistency and potential API functions:

1. Go to Azure Portal → Your Static Web App
2. Navigate to `Settings` → `Configuration`
3. Add the following Application Settings:
   - `NEXT_PUBLIC_AUTH0_DOMAIN`
   - `NEXT_PUBLIC_AUTH0_CLIENT_ID`
   - `NEXT_PUBLIC_AUTH0_AUDIENCE`
   - `DATABASE_URL`
   - `AUTH0_CLIENT_SECRET`

**Note:** Azure Static Web Apps does NOT use these for static content, but they're useful for API functions if you add them later.

## Build Process

The GitHub Actions workflow (`.github/workflows/prod.yml`) now:

1. **Installs dependencies**: `npm ci`
2. **Runs tests**: `npm test`
3. **Generates Prisma client**: `npx prisma generate`
4. **Builds the app** with environment variables:
   ```yaml
   env:
     NEXT_PUBLIC_AUTH0_DOMAIN: ${{ secrets.NEXT_PUBLIC_AUTH0_DOMAIN }}
     NEXT_PUBLIC_AUTH0_CLIENT_ID: ${{ secrets.NEXT_PUBLIC_AUTH0_CLIENT_ID }}
     NEXT_PUBLIC_AUTH0_AUDIENCE: ${{ secrets.NEXT_PUBLIC_AUTH0_AUDIENCE }}
   ```
5. **Deploys to Azure** with `skip_app_build: true` (uses pre-built `out/` directory)

## Verification

After deployment, verify environment variables are working:

1. Open browser DevTools → Console
2. Check if Auth0 config is loaded (it will log errors if vars are missing)
3. Inspect any `_next/static/chunks/*.js` files - they should contain your Auth0 domain

### Debugging

If Auth0 still doesn't work:

**Check Build Logs:**
```bash
# In GitHub Actions logs, look for:
Building with Auth0 Domain: your-tenant.auth0.com...
```

**Check Browser Console:**
- Should NOT see: "Missing required Auth0 environment variables"
- Should NOT see: Domain or ClientId as empty strings

**Check Compiled Code:**
1. View page source in deployed site
2. Find `_next/static/chunks/[hash].js` files
3. Search for your Auth0 domain - it should be present in the code

### Common Issues

❌ **"Auth0 domain is undefined"**
- GitHub secret `NEXT_PUBLIC_AUTH0_DOMAIN` not set
- Secret name typo in workflow file
- Build happened before secret was added (re-run workflow)

❌ **"Callback URL not allowed"**
- Auth0 Application Settings → Allowed Callback URLs
- Add: `https://your-site.azurestaticapps.net/callback`
- Add: `https://your-custom-domain.com/callback`

❌ **Environment variables work locally but not in Azure**
- `.env.local` is not committed (correct behavior)
- GitHub secrets must be configured
- Workflow must pass secrets to build step
- Build must complete successfully before deployment

## Static Export Limitations

With `output: 'export'`, Next.js generates a completely static site:

✅ **Works:**
- Client-side Auth0 authentication
- Browser-based environment variables (`NEXT_PUBLIC_*`)
- Static pages and routing
- Client-side data fetching

❌ **Doesn't Work:**
- Server-side rendering (SSR)
- API Routes (use Azure Functions instead)
- Image Optimization (use `unoptimized: true`)
- Runtime environment variables

## Security Notes

1. **`NEXT_PUBLIC_*` variables are PUBLIC** - visible in browser JavaScript
2. Never put secrets (API keys, database passwords) in `NEXT_PUBLIC_*` variables
3. Use `AUTH0_CLIENT_SECRET` only in server-side code (API functions)
4. Keep `DATABASE_URL` secret - only for build-time Prisma generation
5. Rotate `AZURE_STATIC_WEB_APPS_API_TOKEN` if compromised

## File Structure

```
/Users/pkawle/github/personal/travel-companion/
├── .github/workflows/
│   └── prod.yml                    # CI/CD pipeline with env vars
├── src/lib/
│   └── auth0.ts                    # Auth0 config with validation
├── staticwebapp.config.json        # Azure SWA routing & security
├── next.config.js                  # Static export configuration
└── .env.local.example              # Template (not committed)
```

## Quick Start

1. **Set GitHub Secrets** (one time)
2. **Push to main branch** (triggers build)
3. **Verify deployment** (check browser console)
4. **Configure Auth0 callbacks** (add Azure URL)

## Support

If issues persist:
1. Check GitHub Actions build logs
2. Verify all secrets are set correctly
3. Re-run the workflow after fixing secrets
4. Check Azure Static Web Apps deployment logs
