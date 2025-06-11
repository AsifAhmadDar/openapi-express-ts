# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

We take the security of openapi-express-ts seriously. If you believe you've found a security vulnerability, please follow these steps:

### Where to Report

Please **DO NOT** file a public GitHub issue about security vulnerabilities. Instead:

1. Email the maintainer directly at [maintainer email address]
2. Alternatively, you can report through GitHub's private vulnerability reporting system: 
   - Navigate to the repository
   - Click on "Security" tab
   - Select "Report a vulnerability"

### What to Include

When reporting a vulnerability, please include:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any potential solutions you may have identified

### What to Expect

After you submit a vulnerability report, you can expect:

1. **Acknowledgment**: We will acknowledge your report within 48 hours.
2. **Verification**: We will validate and verify the issue.
3. **Remediation**: We will develop and test a fix.
4. **Disclosure**: Once a fix is ready, we will release a security update.
5. **Recognition**: With your permission, we will acknowledge your contribution in the release notes.

### Security Update Process

When we release security updates, we will:

1. Release a new patch version that addresses the vulnerability
2. Describe the vulnerability in general terms in the release notes
3. Credit the reporter if they wish to be identified

## Best Practices for Users

To ensure you're using openapi-express-ts securely:

1. Keep the library updated to the latest version
2. Apply security best practices in your Express applications
3. Limit access to your OpenAPI documentation in production environments
4. Validate all inputs, even when using automatic validation from the library
5. Consider using additional security middleware like helmet with Express

## Security Dependencies

This project depends on several packages which may have their own security advisories:

- Express
- Swagger UI Express
- TypeScript

We recommend monitoring advisories for these dependencies as well.

## Disclosure Policy

When security vulnerabilities are reported, we follow this disclosure process:

1. The security issue is confirmed
2. A fix is prepared and tested
3. A new release addressing the vulnerability is published
4. The vulnerability details are published after users have had sufficient time to update

Thank you for helping to keep openapi-express-ts and its users safe!
