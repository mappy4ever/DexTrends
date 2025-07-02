# GitHub Actions CI/CD Workflows

This directory contains all GitHub Actions workflows for the DexTrends project. Below is a comprehensive guide to each workflow and how they work together.

## Workflow Status

![CI Pipeline](https://github.com/pakenewell/bi-website/workflows/CI%20Pipeline/badge.svg)
![Visual Regression](https://github.com/pakenewell/bi-website/workflows/Visual%20Regression%20Tests/badge.svg)
![Security Audit](https://github.com/pakenewell/bi-website/workflows/Security%20Audit/badge.svg)
![Performance Tests](https://github.com/pakenewell/bi-website/workflows/Performance%20Tests/badge.svg)

## Workflows Overview

### 1. CI Pipeline (`ci.yml`)
**Trigger:** Push to main, Pull requests
**Purpose:** Main continuous integration pipeline

- **Linting & Type Checking:** Ensures code quality and type safety
- **Unit Tests:** Runs on Node.js 18 and 20 with coverage reporting
- **API Tests:** Tests all API endpoints with mocked dependencies
- **Visual Tests:** Captures screenshots for regression testing
- **Build Verification:** Ensures the application builds successfully
- **Coverage Reporting:** Uploads to Codecov and comments on PRs

### 2. Visual Regression (`visual-regression.yml`)
**Trigger:** Push to main, PR changes to components/pages/styles
**Purpose:** Detect unintended visual changes

- Tests across Chrome, Safari (WebKit), and Firefox
- Compares screenshots against baseline images
- Comments on PRs with visual diff report
- Automatically updates baselines on main branch
- Stores visual artifacts for 30 days

### 3. Security Audit (`security-audit.yml`)
**Trigger:** Push to main, PRs, Daily at 2 AM UTC
**Purpose:** Comprehensive security scanning

- **NPM Audit:** Checks for vulnerable dependencies
- **Secret Scanning:** Uses Gitleaks to detect exposed secrets
- **OWASP Dependency Check:** Scans for known vulnerabilities
- **CodeQL Analysis:** Static code security analysis
- **Security Headers:** Verifies proper HTTP security headers
- **License Compliance:** Ensures no problematic licenses

### 4. Performance Tests (`performance.yml`)
**Trigger:** Push to main, PR changes to core files
**Purpose:** Monitor and prevent performance regressions

- **Bundle Size Analysis:** Tracks JavaScript and CSS bundle sizes
- **Lighthouse CI:** Runs performance audits on key pages
- **Performance Benchmarks:** Playwright-based performance tests
- **Memory Usage:** Monitors server memory consumption
- **Size Comparison:** Compares bundle sizes between branches

### 5. Dependency Updates (`dependency-update.yml`)
**Trigger:** Weekly on Mondays at 3 AM UTC, Manual
**Purpose:** Automated dependency management

- Updates all npm dependencies to latest versions
- Runs security audit fixes
- Creates PR with test results
- Includes automated testing of updates

### 6. Release & Deploy (`release.yml`)
**Trigger:** Version tags (v*), Manual with version input
**Purpose:** Automated release and deployment process

- Creates GitHub releases with changelogs
- Builds and deploys to Vercel
- Creates deployment status updates
- Generates release artifacts

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Essential Secrets
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public Supabase key

### Optional Secrets
- `CODECOV_TOKEN`: For coverage reporting (recommended)
- `NVD_API_KEY`: For OWASP dependency checks
- `GITLEAKS_LICENSE`: For enhanced secret scanning
- `VERCEL_TOKEN`: For automated deployments
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

## CI/CD Scripts

Add these scripts to your `package.json` for CI/CD:

```json
{
  "scripts": {
    "test:ci": "vitest run --coverage --reporter=json --reporter=default",
    "test:coverage:ci": "vitest run --coverage --reporter=json --reporter=junit --outputFile.junit=test-results/junit.xml",
    "lint:ci": "next lint --max-warnings=0",
    "typecheck:ci": "tsc --noEmit --incremental false",
    "build:ci": "next build",
    "test:visual:ci": "playwright test tests/visual --reporter=list,json,html",
    "test:performance:ci": "playwright test tests/performance --reporter=json",
    "test:unit:ci": "vitest run --coverage tests/components tests/api --reporter=json --reporter=junit",
    "lighthouse:ci": "lhci autorun",
    "bundle:analyze": "ANALYZE=true next build && npx bundle-analyzer"
  }
}
```

## Best Practices

### 1. Workflow Optimization
- Use caching for dependencies and build artifacts
- Run jobs in parallel when possible
- Use matrix strategies for multi-version testing
- Cancel in-progress runs for non-main branches

### 2. Security
- Never commit secrets or sensitive data
- Use GitHub Secrets for all credentials
- Enable Dependabot for security updates
- Review security audit results regularly

### 3. Performance
- Monitor bundle sizes on every PR
- Set performance budgets in Lighthouse
- Track memory usage trends
- Use performance comparison between branches

### 4. Testing
- Maintain high test coverage (aim for >80%)
- Include visual regression tests for UI changes
- Test across multiple Node.js versions
- Run API tests with realistic data

### 5. Deployment
- Use semantic versioning for releases
- Generate automated changelogs
- Create deployment status updates
- Keep release artifacts for rollback capability

## Troubleshooting

### Common Issues

1. **Visual tests failing on PR**
   - Review the visual diff report in PR comments
   - Update baselines if changes are intentional: `npm run test:visual:update`

2. **Security audit failures**
   - Run `npm audit fix` locally
   - Update dependencies causing vulnerabilities
   - Review security headers configuration

3. **Performance regressions**
   - Check bundle analysis report
   - Review Lighthouse scores
   - Optimize large dependencies or lazy load them

4. **Build failures**
   - Check TypeScript errors: `npm run typecheck:ci`
   - Review ESLint issues: `npm run lint:ci`
   - Ensure environment variables are set

### Debugging Workflows

1. **Enable debug logging**
   ```yaml
   env:
     ACTIONS_RUNNER_DEBUG: true
     ACTIONS_STEP_DEBUG: true
   ```

2. **Check workflow logs**
   - Click on the failed job in Actions tab
   - Expand failed steps to see detailed logs
   - Download artifacts for local inspection

3. **Run workflows locally**
   - Use [act](https://github.com/nektos/act) to test workflows locally
   - Example: `act -j test-unit`

## Maintenance

### Regular Tasks
- Review and update workflow dependencies monthly
- Check for deprecated GitHub Actions
- Update Node.js versions as new LTS releases come out
- Review and adjust performance budgets quarterly
- Clean up old workflow artifacts

### Monitoring
- Set up GitHub notifications for workflow failures
- Monitor workflow run times and optimize if needed
- Track CI/CD costs and usage
- Review security scan results weekly

## Contributing

When adding new workflows:
1. Follow the existing naming conventions
2. Include comprehensive comments
3. Add the workflow to this README
4. Test thoroughly before merging
5. Update required secrets documentation