---
name: cicd-automation
description: Design and implement CI/CD pipelines for automated software delivery
allowed-tools: Read, Write, Edit, Bash
category: DevOps
tags:
  - ci-cd
  - automation
  - devops
  - pipeline
---

# CI/CD Automation Skill

This skill helps you design and implement effective CI/CD pipelines.

## CI/CD Principles

### Continuous Integration (CI)
- Automated builds on every commit
- Run tests automatically
- Code quality checks (linting, formatting)
- Security scanning
- Fast feedback loops (< 10 minutes ideally)
- Build artifacts and versioning

### Continuous Delivery/Deployment (CD)
- Automated deployment to staging
- Automated testing in staging
- Manual approval for production (CD)
- Automated deployment to production (Continuous Deployment)
- Blue-green or canary deployments
- Automated rollbacks

## Pipeline Stages

### 1. Build Stage
```yaml
build:
  - Install dependencies
  - Compile/transpile code
  - Run linters and formatters
  - Check code style
  - Generate build artifacts
```

### 2. Test Stage
```yaml
test:
  - Unit tests
  - Integration tests
  - Code coverage reports
  - Test result publishing
```

### 3. Security & Quality Stage
```yaml
security:
  - SAST (Static Application Security Testing)
  - Dependency scanning
  - Secret scanning
  - Code quality analysis (SonarQube)
  - License compliance
```

### 4. Package Stage
```yaml
package:
  - Build Docker images
  - Tag with version/commit SHA
  - Push to container registry
  - Create release artifacts
```

### 5. Deploy Stage
```yaml
deploy:
  - Deploy to staging
  - Run smoke tests
  - Deploy to production (manual/auto)
  - Health checks
  - Rollback if needed
```

## Platform-Specific Examples

### GitHub Actions
```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - run: npm run deploy
```

### GitLab CI/CD
```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  script:
    - npm test

deploy_prod:
  stage: deploy
  script:
    - npm run deploy
  only:
    - main
  when: manual
```

### Jenkins Pipeline
```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'npm run deploy'
            }
        }
    }
}
```

## Best Practices

### Pipeline Design
- Keep pipelines fast (parallel jobs)
- Fail fast (run quick tests first)
- Use caching for dependencies
- Separate build and deploy stages
- Make pipelines reproducible
- Use pipeline as code (version control)

### Security
- Scan for vulnerabilities
- Use secret management (not hardcoded)
- Implement RBAC for deployments
- Sign artifacts
- Audit pipeline executions
- Rotate credentials regularly

### Testing Strategy
- Unit tests (fast, comprehensive)
- Integration tests (critical paths)
- E2E tests (smoke tests only in CI)
- Performance tests (before production)
- Security tests (SAST, DAST)

### Deployment Strategies
- **Blue-Green**: Two identical environments, switch traffic
- **Canary**: Gradual rollout to subset of users
- **Rolling**: Update instances one by one
- **Feature Flags**: Deploy code, enable features gradually

### Monitoring & Observability
- Pipeline execution metrics
- Deployment frequency
- Mean time to recovery (MTTR)
- Change failure rate
- Lead time for changes
- Automated alerts on failures

## Environment Management

### Development
- Deploy on feature branch pushes
- Automated cleanup of old environments
- Personal development environments

### Staging
- Mirror production configuration
- Automated deployments from main/develop
- Run full test suite
- Performance testing

### Production
- Manual approval or automated with gates
- Canary or blue-green deployment
- Automated rollback on health check failures
- Comprehensive monitoring

## Artifact Management

### Versioning
- Semantic versioning (major.minor.patch)
- Git commit SHA in version
- Build number
- Tags for releases

### Storage
- Container registries (Docker Hub, ECR, GCR)
- Artifact repositories (Artifactory, Nexus)
- Cloud storage (S3, GCS, Azure Blob)
- Retention policies

## Tools & Platforms

### CI/CD Platforms
- **GitHub Actions**: Integrated with GitHub
- **GitLab CI/CD**: Built into GitLab
- **Jenkins**: Open-source, highly customizable
- **CircleCI**: Cloud-based, fast
- **Travis CI**: Simple configuration
- **Azure DevOps**: Microsoft ecosystem
- **AWS CodePipeline**: AWS services

### Supporting Tools
- **Docker**: Containerization
- **Terraform**: Infrastructure as Code
- **Ansible**: Configuration management
- **Kubernetes**: Container orchestration
- **ArgoCD**: GitOps continuous delivery

## Metrics & KPIs

### DORA Metrics
- **Deployment Frequency**: How often you deploy
- **Lead Time for Changes**: Time from commit to production
- **Mean Time to Recovery**: Time to restore service
- **Change Failure Rate**: % of deployments causing failures

### Pipeline Metrics
- Build success rate
- Average build time
- Test coverage
- Security vulnerabilities found
- Deployment success rate

## Checklist

- [ ] Pipeline runs on every commit
- [ ] Tests run automatically
- [ ] Code quality checks in place
- [ ] Security scanning enabled
- [ ] Automated deployments to staging
- [ ] Production deployments controlled
- [ ] Rollback mechanism implemented
- [ ] Monitoring and alerts configured
- [ ] Secrets managed securely
- [ ] Pipeline metrics tracked

## Usage

When setting up CI/CD:
1. Define pipeline stages
2. Implement automated testing
3. Add security and quality gates
4. Configure deployment strategies
5. Set up monitoring and alerts
6. Document the process
7. Iterate and improve based on metrics
