---
name: docker-expert
description: Expert guidance on Docker containerization and best practices
allowed-tools: Read, Write, Edit, Bash
category: DevOps
tags:
  - docker
  - containers
  - devops
  - deployment
---

# Docker Expert Skill

This skill provides expert guidance on Docker containerization.

## Dockerfile Best Practices

### Multi-Stage Builds
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --production
CMD ["node", "dist/index.js"]
```

### Layer Optimization
- Put frequently changing instructions last
- Combine RUN commands to reduce layers
- Use .dockerignore to exclude unnecessary files
- Copy dependency files before source code
- Clear package manager cache

### Security
- Use specific version tags, not `latest`
- Run as non-root user
- Scan images for vulnerabilities (Trivy, Snyk)
- Use minimal base images (alpine, distroless)
- Don't include secrets in images
- Keep images up to date

### Size Optimization
- Use alpine or distroless base images
- Remove unnecessary packages
- Clean package manager cache
- Use multi-stage builds
- Minimize layers

## Docker Compose

### Development Environment
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_PASSWORD=secret
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

### Best Practices
- Use environment files for configuration
- Define healthchecks
- Set resource limits
- Use named volumes for persistence
- Override for different environments

## Container Orchestration

### Kubernetes Basics
- Deployments for stateless apps
- StatefulSets for stateful apps
- Services for networking
- ConfigMaps and Secrets for configuration
- Ingress for external access
- Persistent Volumes for storage

### Docker Swarm
- Simple orchestration alternative
- Built into Docker
- Good for smaller deployments
- Stack files (docker-compose.yml extended)

## Networking

### Network Types
- **Bridge**: Default, isolated network
- **Host**: Use host's network stack
- **None**: No networking
- **Overlay**: Multi-host networking

### Best Practices
- Use custom bridge networks
- Avoid host network mode in production
- Implement network segmentation
- Use service discovery (DNS)

## Volume Management

### Volume Types
- **Named Volumes**: Managed by Docker
- **Bind Mounts**: Direct host filesystem access
- **tmpfs**: In-memory temporary storage

### Best Practices
- Use named volumes for production data
- Backup volumes regularly
- Set appropriate permissions
- Use volume drivers for cloud storage

## Monitoring & Logging

### Logging
- Use JSON logging driver
- Centralized log aggregation (ELK, Loki)
- Log rotation configuration
- Structured logging

### Monitoring
- Container metrics (CPU, memory, network)
- Health checks
- Resource limits and requests
- Prometheus and Grafana

## CI/CD Integration

### Building Images
- Tag with version/commit SHA
- Push to container registry
- Scan for vulnerabilities
- Sign images for verification

### Deployment
- Blue-green deployments
- Rolling updates
- Automated rollbacks
- Canary releases

## Common Patterns

### Reverse Proxy
```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
  depends_on:
    - app
```

### Init Containers
- Database migrations
- Configuration setup
- Dependency checks

## Troubleshooting

### Debugging Commands
```bash
docker logs <container>
docker exec -it <container> sh
docker inspect <container>
docker stats
docker system df
```

### Common Issues
- Port conflicts
- Volume permissions
- Network connectivity
- Out of disk space
- Resource constraints

## Security Checklist

- [ ] Run as non-root user
- [ ] No secrets in images
- [ ] Use specific image tags
- [ ] Images scanned for vulnerabilities
- [ ] Minimal base images
- [ ] Read-only filesystems where possible
- [ ] Resource limits set
- [ ] Network segmentation implemented

## Tools

- **Build**: docker build, BuildKit, buildx
- **Compose**: docker-compose, docker stack
- **Registry**: Docker Hub, ECR, GCR, Harbor
- **Security**: Trivy, Snyk, Anchore
- **Monitoring**: Prometheus, Grafana, cAdvisor

## Usage

When working with Docker:
1. Write efficient Dockerfiles
2. Use docker-compose for local development
3. Implement proper security practices
4. Optimize image size
5. Set up monitoring and logging
6. Plan for production deployment
