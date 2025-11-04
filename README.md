# Travel Companion AU

A privacy-first travel companion matching platform connecting travelers on the same flight for language assistance and companionship.

## Quick Start

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/pranavkawle/travel-companion.git
   cd travel-companion
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your Auth0 and database credentials
   ```

3. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Documentation

- 📚 [Azure Deployment Guide](./docs/AZURE_DEPLOYMENT.md) - Complete guide for deploying to Azure Static Web Apps
- 🔧 [Quick Fix: Auth0 Environment Variables](./docs/QUICK_FIX.md) - Troubleshooting Auth0 configuration issues
- ✅ [Testing Guide](./docs/TESTING.md) - Running tests and coverage reports

## Tech Stack

- **Framework**: Next.js 14 (App Router, Static Export)
- **Authentication**: Auth0
- **Database**: Azure SQL Server (via Prisma)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Testing**: Jest + React Testing Library
- **Deployment**: Azure Static Web Apps

## Project Structure

```
travel-companion/
├── .github/workflows/    # CI/CD pipelines (dev, stage, prod)
├── docs/                 # Documentation
├── prisma/              # Database schema and migrations
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configurations
│   ├── styles/         # Global styles
│   └── types/          # TypeScript type definitions
├── specs/              # Feature specifications
└── tests/              # Test suites
```

## Environment Variables

Required variables (see `.env.local.template`):

- `NEXT_PUBLIC_AUTH0_DOMAIN` - Your Auth0 tenant domain
- `NEXT_PUBLIC_AUTH0_CLIENT_ID` - Auth0 application client ID
- `NEXT_PUBLIC_AUTH0_AUDIENCE` - Auth0 API audience (optional)
- `DATABASE_URL` - Azure SQL Server connection string
- `SHADOW_DATABASE_URL` - Shadow database for Prisma migrations

⚠️ **Important**: For Azure deployments, these must be configured as GitHub Secrets. See [Azure Deployment Guide](./docs/AZURE_DEPLOYMENT.md).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server (static export)
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run linter
- `npm run format` - Format code with Biome

## Deployment

### Azure Static Web Apps

The application is automatically deployed to Azure Static Web Apps via GitHub Actions:

- **Production**: Push to `main` branch
- **Staging**: Push to `stage` branch
- **Development**: Push to `dev` branch

See [Azure Deployment Guide](./docs/AZURE_DEPLOYMENT.md) for detailed instructions.

## Contributing

1. Create a feature branch from `dev`
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request

## License

See [LICENSE](./LICENSE) file for details.

## Support

For deployment issues, see:
- [Quick Fix Guide](./docs/QUICK_FIX.md)
- [Azure Deployment Guide](./docs/AZURE_DEPLOYMENT.md)