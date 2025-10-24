# Security Policy

## Overview

This document outlines security best practices for contributing to and deploying this project. This is an educational project and may contain mock implementations for demonstration purposes.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it by:

1. **DO NOT** open a public GitHub issue
2. Email the repository owner directly (check GitHub profile for contact)
3. Include detailed steps to reproduce the vulnerability
4. Allow reasonable time for a fix before public disclosure

## Environment Variables & Secrets

### ⚠️ CRITICAL: Never Commit Real Secrets

**All `.env.example` files contain placeholder values only.** Real credentials should NEVER be committed to version control.

### Setting Up Your Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp apps/app/.env.example apps/app/.env.local
   ```

2. Fill in your actual credentials in `.env.local` (this file is gitignored)

3. **NEVER** commit `.env.local` or any file containing real secrets

### Protected Files

The following files are automatically ignored by git (see `.gitignore`):

- `.env`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- `.env*.local`
- `.env.sentry-build-plugin`
- `*.pem` (SSL certificates, private keys)

### Environment Variable Checklist

Before committing changes, verify:

- [ ] No real API keys in code
- [ ] No hardcoded passwords or tokens
- [ ] All sensitive values use `process.env.VARIABLE_NAME`
- [ ] `.env.example` contains only placeholder values
- [ ] `.env.local` is in `.gitignore`

## Third-Party Services & API Keys

This project integrates with multiple third-party services. You'll need your own accounts and API keys for:

### Authentication & User Management
- **Clerk**: User authentication (`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
- **Auth0**: Alternative authentication option

### Database & Storage
- **PostgreSQL/Neon**: Primary database (`DATABASE_URL`, `DIRECT_URL`)
- **Redis/Upstash**: Caching and session storage
- **Cloudflare R2**: Object storage (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`)
- **DigitalOcean Spaces**: Alternative object storage

### Payment Processing
- **Paddle**: Payment processing (`PADDLE_SECRET_KEY`, `PADDLE_CLIENT_TOKEN`)

### Email Services
- **Resend**: Transactional emails (`RESEND_API_KEY`)

### Monitoring & Analytics
- **Sentry**: Error tracking (`SENTRY_AUTH_TOKEN`)
- **PostHog**: Product analytics (`NEXT_PUBLIC_POSTHOG_KEY`)
- **Google Analytics**: Web analytics
- **BetterStack**: Uptime monitoring

### Document Processing
- **PDF.co**: PDF processing (`PDFCO_API_KEY`)

### Content Management
- **BaseHub**: CMS integration (`BASEHUB_TOKEN`)
- **Liveblocks**: Real-time collaboration

### Security & Rate Limiting
- **Arcjet**: Rate limiting and security (`ARCJET_KEY`)

## Security Best Practices

### For Contributors

1. **Code Review**
   - Never commit secrets, API keys, or credentials
   - Review `.env.example` changes carefully
   - Use environment variables for all configuration

2. **Dependencies**
   - Keep dependencies updated (run `pnpm update` regularly)
   - Review security advisories: `pnpm audit`
   - Use `pnpm audit fix` to auto-fix vulnerabilities

3. **Git Hygiene**
   - Check files before committing: `git status`, `git diff`
   - Use `.gitignore` to exclude sensitive files
   - Never use `git add .` blindly

4. **Testing**
   - Test with mock/development credentials only
   - Never use production credentials in test environments
   - Sanitize test data (no real user information)

### For Deployment

1. **Environment Separation**
   - Use different credentials for dev/staging/production
   - Never share production credentials
   - Rotate keys regularly

2. **Access Control**
   - Use IAM roles and least-privilege access
   - Enable MFA on all admin accounts
   - Regularly audit user permissions

3. **Secrets Management**
   - Use platform-provided secrets management:
     - Vercel: Environment Variables (encrypted)
     - AWS: Secrets Manager or Parameter Store
     - Self-hosted: HashiCorp Vault, Doppler, or similar
   - Never log secrets or credentials
   - Rotate secrets on a regular schedule

4. **HTTPS & Encryption**
   - Always use HTTPS in production
   - Enable SSL/TLS for database connections
   - Encrypt sensitive data at rest

5. **Monitoring**
   - Enable error tracking (Sentry)
   - Monitor for unusual activity
   - Set up security alerts
   - Review logs regularly

## Common Security Pitfalls to Avoid

### ❌ DON'T DO THIS

```typescript
// ❌ Hardcoded API key
const API_KEY = "sk_live_abc123xyz789";

// ❌ Committed credentials
const databaseUrl = "postgresql://user:password@host/db";

// ❌ Exposed in client-side code
const secretKey = process.env.SECRET_KEY; // If this is in client component!
```

### ✅ DO THIS INSTEAD

```typescript
// ✅ Use environment variables
const API_KEY = process.env.API_KEY;

// ✅ Server-side only
// Mark server components or use API routes
export async function getServerSideProps() {
  const data = await fetchWithSecret(process.env.SECRET_KEY);
  return { props: { data } };
}

// ✅ Use NEXT_PUBLIC_ prefix for client-side (non-sensitive only)
const publicKey = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY;
```

## Data Privacy

### Mock Data

All mock data in this repository uses **fictional information**:
- Mock company names (ABC Corp, XYZ Ltd, etc.)
- Generic email addresses (noreply@example.com)
- Placeholder phone numbers
- Fictional dollar amounts

### User Data

When implementing real features:
- Collect only necessary data (data minimization)
- Implement proper consent mechanisms (GDPR compliance)
- Provide data export/deletion capabilities
- Use encryption for sensitive data
- Anonymize analytics data

## Incident Response

If you accidentally commit secrets:

1. **Immediately rotate the exposed credentials** at the service provider
2. Remove the secret from git history:
   ```bash
   # Use BFG Repo-Cleaner or git filter-branch
   # https://rtyley.github.io/bfg-repo-cleaner/
   ```
3. Force push the cleaned history (⚠️ coordinate with team)
4. Document the incident
5. Review and improve processes to prevent recurrence

## Compliance

For production deployments, consider:

- **GDPR** (EU): Data protection and privacy
- **CCPA** (California): Consumer privacy rights
- **SOC 2**: Security and availability controls
- **PCI DSS**: If handling credit card data directly
- **HIPAA**: If handling health information

## Security Checklist for Public Release

Before making this repository public:

- [x] All `.env.example` files contain only placeholders
- [x] No hardcoded secrets in source code
- [x] No real email addresses (except generic ones)
- [x] No real API keys or tokens
- [x] `.gitignore` includes all sensitive file patterns
- [x] No committed `.env.local` files
- [x] Documentation doesn't reveal sensitive infrastructure details
- [ ] All production credentials rotated (if previously exposed)
- [ ] Security audit completed
- [ ] README includes setup instructions without sensitive data

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist#security)

## Questions?

If you have security questions or concerns, please reach out to the repository maintainers.

---

**Last Updated**: January 2025
