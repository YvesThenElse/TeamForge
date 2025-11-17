---
name: infrastructure-as-code
description: Manage infrastructure using code (Terraform, CloudFormation, etc.)
allowed-tools: Read, Write, Edit, Bash
category: DevOps
tags:
  - iac
  - terraform
  - infrastructure
  - automation
---

# Infrastructure as Code (IaC) Skill

This skill helps you manage infrastructure using code and automation.

## IaC Principles

### Benefits
- **Version Control**: Track infrastructure changes in Git
- **Reproducibility**: Create identical environments
- **Documentation**: Code documents the infrastructure
- **Testing**: Test infrastructure changes before applying
- **Collaboration**: Team reviews via pull requests
- **Automation**: Integrate with CI/CD pipelines

### Key Concepts
- **Declarative**: Describe desired state (not steps)
- **Idempotent**: Applying multiple times = same result
- **Immutable Infrastructure**: Replace instead of modify
- **State Management**: Track current infrastructure state

## Terraform

### Basic Structure
```hcl
# Provider configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

# Resources
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  tags = {
    Name        = "web-server-${var.environment}"
    Environment = var.environment
  }
}

# Outputs
output "instance_ip" {
  value = aws_instance.web.public_ip
}
```

### Best Practices
- Use modules for reusability
- Separate environments (dev, staging, prod)
- Use remote state (S3, Terraform Cloud)
- Enable state locking
- Use variables and locals
- Tag all resources
- Implement naming conventions
- Use data sources for lookups

### Project Structure
```
terraform/
├── modules/
│   ├── vpc/
│   ├── ec2/
│   └── rds/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
├── variables.tf
├── outputs.tf
├── main.tf
└── versions.tf
```

### State Management
- Store state remotely (S3 + DynamoDB for locking)
- Never commit state files to Git
- Use workspaces for environments
- Regular state backups
- Implement state encryption

## Other IaC Tools

### AWS CloudFormation
```yaml
Resources:
  WebServer:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref LatestAmiId
      InstanceType: t3.micro
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-web-server'
```

### Azure Resource Manager (ARM)
```json
{
  "type": "Microsoft.Compute/virtualMachines",
  "apiVersion": "2021-03-01",
  "name": "[parameters('vmName')]",
  "location": "[parameters('location')]"
}
```

### Pulumi (Code-based IaC)
```typescript
import * as aws from "@pulumi/aws";

const server = new aws.ec2.Instance("web-server", {
    ami: "ami-0c55b159cbfafe1f0",
    instanceType: "t3.micro",
    tags: { Name: "web-server" }
});

export const publicIp = server.publicIp;
```

### Ansible (Configuration Management)
```yaml
---
- name: Configure web servers
  hosts: webservers
  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present
    - name: Start nginx
      service:
        name: nginx
        state: started
```

## Infrastructure Patterns

### VPC & Networking
```hcl
module "vpc" {
  source = "./modules/vpc"

  cidr_block           = "10.0.0.0/16"
  availability_zones   = ["us-east-1a", "us-east-1b"]
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]

  enable_nat_gateway = true
  enable_dns         = true

  tags = var.tags
}
```

### Load Balancer + Auto Scaling
```hcl
resource "aws_lb" "main" {
  name               = "${var.environment}-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb.id]
  subnets            = module.vpc.public_subnets
}

resource "aws_autoscaling_group" "app" {
  desired_capacity = var.desired_capacity
  max_size         = var.max_size
  min_size         = var.min_size

  vpc_zone_identifier = module.vpc.private_subnets
  target_group_arns   = [aws_lb_target_group.app.arn]

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }
}
```

### Database with Backups
```hcl
resource "aws_db_instance" "main" {
  identifier           = "${var.environment}-db"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_storage

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  skip_final_snapshot = false
  final_snapshot_identifier = "${var.environment}-db-final"

  tags = var.tags
}
```

## Testing Infrastructure

### Terraform Testing
- `terraform plan` (dry run)
- `terraform validate` (syntax check)
- `terraform fmt -check` (formatting)
- Terratest (automated testing)
- Checkov (security scanning)

### Security Scanning
- tfsec (Terraform security)
- Checkov (multi-tool security)
- Terrascan (compliance)
- KICS (security scanning)

## CI/CD Integration

### Workflow
```yaml
name: Terraform

on:
  pull_request:
  push:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Terraform Format
        run: terraform fmt -check

      - name: Terraform Init
        run: terraform init

      - name: Terraform Plan
        run: terraform plan -out=plan.tfplan

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply plan.tfplan
```

## Best Practices

### Security
- Never hardcode secrets
- Use secret managers (AWS Secrets Manager, HashiCorp Vault)
- Encrypt state files
- Implement least privilege IAM
- Enable MFA for critical operations
- Scan for security issues

### Organization
- Use modules for reusability
- Separate state per environment
- Implement naming conventions
- Tag all resources consistently
- Document module usage
- Keep provider versions pinned

### Change Management
- Always run `terraform plan` first
- Review changes in pull requests
- Test in non-production first
- Implement change windows
- Have rollback procedures
- Monitor infrastructure changes

## Checklist

- [ ] Infrastructure defined as code
- [ ] State stored remotely
- [ ] State locking enabled
- [ ] Modules used for reusability
- [ ] Environments separated
- [ ] Security scanning in place
- [ ] CI/CD integration
- [ ] Documentation up to date
- [ ] Backup and disaster recovery planned
- [ ] Cost optimization implemented

## Tools

- **IaC**: Terraform, Pulumi, CloudFormation, ARM Templates
- **Configuration**: Ansible, Chef, Puppet
- **Testing**: Terratest, kitchen-terraform
- **Security**: tfsec, Checkov, Terrascan
- **State Management**: Terraform Cloud, Consul, S3

## Usage

When working with IaC:
1. Define infrastructure requirements
2. Design modular, reusable components
3. Implement with chosen IaC tool
4. Test changes before applying
5. Scan for security issues
6. Apply changes in controlled manner
7. Monitor and maintain infrastructure
