# AgentFoundry Security Policy 🛡️

AgentFoundry is committed to maintaining the highest security standards for our users and the open-source community. This document outlines our strategies for preventing supply-chain attacks and protecting against malicious dependencies.

## 1. Dependency Security & Management

To avoid the "panics" associated with malicious package injection (e.g., typosquatting or compromised updates), we employ a multi-layered defense:

- **Strict Version Pinning:** We use a `pnpm-lock.yaml` file to ensure that every installation uses the exact same, verified bytes of each package. This prevents "stealth" updates that might introduce malware.
- **Dependency Sandboxing:** AgentFoundry V2 is designed to be "Local-First". Our core logic avoids executing arbitrary code from dependencies at runtime.
- **Automated Scanning (Dependabot/Snyk):** We utilize GitHub Dependabot to automatically scan for known vulnerabilities (CVEs) and notify maintainers of required security patches.
- **Manual Audits:** We perform quarterly manual audits of our top-level dependencies, looking for unmaintained packages, ownership changes, or suspicious network behavior.

## 2. Recommendation for Users

- **Global Install Safety:** Always install AgentFoundry using the official registry: `npm install -g @agentfoundry/cli`.
- **Environment Isolation:** We recommend running the `agentfoundry watch` daemon in a dedicated development environment or container if you are working on highly sensitive projects.

## 3. Reporting a Vulnerability

If you discover a security vulnerability within AgentFoundry, please follow these steps:

1. **Do NOT open a public GitHub issue.** This protects the community from active exploitation while we develop a fix.
2. **Email the maintainers:** Send a detailed report to `security@agentfoundry.ai` (or your preferred contact).
3. **Wait for confirmation:** We will acknowledge your report within 48 hours and provide a timeline for the resolution.

## 4. Responsible Disclosure

We believe in responsible disclosure. Once a vulnerability is patched, we will:
- Publish a Security Advisory on GitHub.
- Credit the researcher for their discovery.
- Release an updated version with a mandatory upgrade notice for CLI users.

---

*By following these protocols, AgentFoundry ensures it remains a robust and trustworthy tool for the global developer ecosystem.*
