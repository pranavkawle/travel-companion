# Quick Fix Guide: Auth0 Environment Variables in Azure

## What Was Fixed

### Problem
After deploying to Azure Static Web Apps, the build was failing with:
```
Error: Missing required Auth0 environment variables: NEXT_PUBLIC_AUTH0_DOMAIN, NEXT_PUBLIC_AUTH0_CLIENT_ID
Error occurred prerendering page "/"
```

### Root Cause
Two issues:
1. Next.js static exports (`output: 'export'`) require `NEXT_PUBLIC_*` environment variables to be available **during the build process**, not at runtime
2. Our validation code was throwing errors during the static page generation phase (build time), preventing the build from completing

### Solution Implemented

✅ **Fixed Auth0 configuration** (`src/lib/auth0.ts`) - **CRITICAL FIX**:
- Modified validation to only run in browser (client-side), not during build
- Allows build to complete without environment variables
- Still validates and logs warnings in browser console when variables are missing
- Created `isAuth0Configured()` helper function

✅ **Updated GitHub Actions workflow** (`.github/workflows/prod.yml` and `stage.yml`):
- Separated build step from deployment step
- Added explicit Prisma client generation
- Ensured environment variables are passed to the build step
- Added `skip_app_build: true` to Azure deployment (uses pre-built artifacts)

✅ **Improved error handling** (`src/app/layout.tsx`):
- Shows user-friendly error page if Auth0 is not configured
- Prevents app crash with helpful debugging information

✅ **Created Azure Static Web Apps config** (`staticwebapp.config.json`):
- Added proper routing for Next.js static export
- Configured security headers
- Set up caching policies

✅ **Created deployment documentation** (`docs/AZURE_DEPLOYMENT.md`):
- Complete guide for configuring GitHub secrets
- Troubleshooting steps
- Security best practices

## What You Need to Do

### 1. Verify GitHub Secrets Are Set

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Ensure these secrets exist:
- ✅ `NEXT_PUBLIC_AUTH0_DOMAIN`
- ✅ `NEXT_PUBLIC_AUTH0_CLIENT_ID`
- ✅ `NEXT_PUBLIC_AUTH0_AUDIENCE` (optional)
- ✅ `DATABASE_URL`
- ✅ `SHADOW_DATABASE_URL`
- ✅ `AUTH0_CLIENT_SECRET`
- ✅ `AZURE_STATIC_WEB_APPS_API_TOKEN_KIND_ISLAND_0755F0900`

### 2. Re-run the GitHub Actions Workflow

After the code changes are pushed:

1. Go to **Actions** tab in GitHub
2. Select the failed workflow run
3. Click **Re-run all jobs**

OR push a new commit:
```bash
git add .
git commit -m "Fix: Auth0 environment variables for Azure deployment"
git push origin main  # or your branch
```

### 3. Verify the Build Logs

In the GitHub Actions logs, you should see:
```
Building with Auth0 Domain: your-tenant.auth0...
✓ Compiled successfully
```

### 4. Update Auth0 Callback URLs

In your Auth0 Dashboard:

1. Go to **Applications → Your App → Settings**
2. Add to **Allowed Callback URLs**:
   ```
   https://your-app.azurestaticapps.net/callback
   ```
3. Add to **Allowed Logout URLs**:
   ```
   https://your-app.azurestaticapps.net/
   ```
4. Add to **Allowed Web Origins**:
   ```
   https://your-app.azurestaticapps.net
   ```

### 5. Test the Deployment

1. Open your Azure Static Web App URL in a browser
2. Open DevTools → Console
3. You should **NOT** see: "Missing required Auth0 environment variables"
4. Try to login - it should redirect to Auth0

## Verification Checklist

- [ ] All GitHub secrets are configured
- [ ] Workflow runs successfully (check Actions tab)
- [ ] Build completes without errors
- [ ] Deployment succeeds
- [ ] No "Missing required Auth0 environment variables" errors in browser console
- [ ] Auth0 callback URLs include your Azure domain
- [ ] Login redirects to Auth0 correctly
- [ ] User can complete authentication

## If It Still Doesn't Work

### Check Build Artifacts
In the GitHub Actions logs, look for:
```yaml
Building with Auth0 Domain: your-tenant.auth0...
```

If you see "Building with Auth0 Domain: ...", the secret is empty!

### Check Browser Console
Open DevTools → Console on your deployed site:
- ❌ "Missing required Auth0 environment variables" → GitHub secret not set correctly
- ❌ "Failed to fetch" → CORS issue with Auth0 domain
- ❌ "Callback URL mismatch" → Update Auth0 Allowed Callback URLs

### Check Compiled Code
1. View page source
2. Find `_next/static/chunks/*.js` files
3. Search for your Auth0 domain
4. If not found → environment variable wasn't available during build

### Common Fixes

**Secret name typo:**
```yaml
# ❌ Wrong
NEXT_PUBLIC_AUTH_DOMAIN: ${{ secrets.AUTH0_DOMAIN }}

# ✅ Correct
NEXT_PUBLIC_AUTH0_DOMAIN: ${{ secrets.NEXT_PUBLIC_AUTH0_DOMAIN }}
```

**Secret not saved:**
- Re-save the secret in GitHub
- Make sure you clicked "Add secret" or "Update secret"
- Re-run the workflow

**Old build cached:**
- Delete and re-create Azure Static Web App deployment
- Or push a new commit to trigger fresh build

## Files Changed

- `.github/workflows/prod.yml` - Updated build process
- `.github/workflows/stage.yml` - Updated build process
- `src/lib/auth0.ts` - Added validation and error handling
- `src/app/layout.tsx` - Added configuration error page
- `staticwebapp.config.json` - Created Azure configuration
- `docs/AZURE_DEPLOYMENT.md` - Created deployment guide
- `docs/QUICK_FIX.md` - This file

## Need More Help?

See the complete guide: [docs/AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)
