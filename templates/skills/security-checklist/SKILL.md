# Security Checklist

## Input Validation

- [ ] Validate all user input before use (type, length, format, range)
- [ ] Reject on validation failure -- do not sanitize and continue
- [ ] Validate file paths against traversal (`../` sequences)
- [ ] Validate URLs against SSRF (Server-Side Request Forgery)

## Authentication & Authorization

- [ ] Require authentication before sensitive operations
- [ ] Check authorization per resource, not just per endpoint
- [ ] Tokens/Sessions can expire and be revoked
- [ ] Hash passwords with bcrypt/argon2 (never MD5/SHA1 alone)
- [ ] Login endpoints have brute-force protection

## Data Handling

- [ ] Secrets never logged
- [ ] PII minimized -- only collect required data
- [ ] Sensitive data encrypted at rest
- [ ] Enforce TLS for external communication
- [ ] SQL queries parameterized (no string concatenation)

## Dependencies

- [ ] No known CVEs in direct dependencies
- [ ] Dependency versions locked
- [ ] No deprecated packages in critical paths

## API Security

- [ ] Rate limiting on public endpoints
- [ ] CORS configured to allow only known origins
- [ ] Content-Security-Policy header set
- [ ] Sensitive endpoints not exposed without authentication

## Secret Management

- [ ] No API keys or passwords in source code
- [ ] Environment variable names don't contain loggable credentials
- [ ] Secrets injected via environment variables, never config files in repo
- [ ] Secret rotation process documented
