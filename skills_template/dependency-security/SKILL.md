---
name: dependency-security
description: Audit and manage security of project dependencies
allowed-tools: Read, Bash, Grep
category: Security
tags:
  - dependencies
  - security
  - vulnerabilities
  - supply-chain
---

# Dependency Security Skill

This skill helps you audit and manage the security of project dependencies.

## Capabilities

### Vulnerability Scanning
- Scan dependencies for known CVEs
- Check for outdated packages
- Identify transitive dependency issues
- Monitor security advisories
- Prioritize vulnerabilities by severity (CVSS scores)

### Supply Chain Security
- Verify package integrity (checksums, signatures)
- Check for typosquatting
- Review package maintainer reputation
- Monitor for malicious packages
- Use lock files (package-lock.json, Cargo.lock, go.sum)

### Dependency Management
- Keep dependencies up to date
- Remove unused dependencies
- Minimize dependency tree depth
- Prefer well-maintained packages
- Review license compatibility

### Best Practices
- Pin dependency versions in production
- Use automated dependency updates (Dependabot, Renovate)
- Regular security audits
- Subscribe to security advisories
- Implement dependency approval process
- Use private package registries for internal packages

## Language-Specific Tools

### JavaScript/TypeScript
- `npm audit` / `yarn audit` / `pnpm audit`
- Snyk, WhiteSource
- GitHub Dependabot
- Socket Security

### Python
- `pip-audit`
- Safety
- Snyk
- OWASP Dependency-Check

### Java
- OWASP Dependency-Check
- Snyk
- JFrog Xray
- GitHub Dependabot

### Rust
- `cargo audit`
- `cargo-deny`

### Go
- `govulncheck`
- Snyk
- OWASP Dependency-Check

### .NET
- `dotnet list package --vulnerable`
- OWASP Dependency-Check
- WhiteSource

## Severity Levels

- **Critical**: Immediate action required, exploitable remotely
- **High**: High risk, should be addressed quickly
- **Medium**: Moderate risk, plan to address
- **Low**: Minor risk, address when convenient

## Remediation Strategies

1. **Update to Patched Version**: Preferred solution
2. **Apply Security Patch**: If update not available
3. **Find Alternative Package**: If package abandoned
4. **Implement Workarounds**: Temporary mitigation
5. **Accept Risk**: Document decision with justification

## Review Checklist

- [ ] All dependencies scanned for vulnerabilities
- [ ] Critical and high vulnerabilities addressed
- [ ] Dependencies are up to date
- [ ] Lock files are committed
- [ ] Unused dependencies removed
- [ ] Automated dependency updates configured
- [ ] Security policy documented

## CI/CD Integration

- Run security scans on every PR
- Block merges with critical vulnerabilities
- Generate security reports
- Automate dependency updates
- Monitor production dependencies

## Usage

When auditing dependencies:
1. Scan all dependencies for vulnerabilities
2. Review the dependency tree
3. Identify and prioritize risks
4. Update or patch vulnerable dependencies
5. Document any accepted risks
6. Set up automated monitoring
