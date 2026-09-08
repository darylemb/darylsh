---
title: "Cloud Infrastructure Automation"
description: "Multi-cloud infrastructure automation with Terraform for reproducibility and faster deployments."
pubDate: 2026-09-07
lang: "en"
order: 1
featured: true
tags:
  - name: "Terraform"
    icon: "/tech-logos/terraform.svg"
  - name: "AWS"
    icon: "/tech-logos/aws.svg"
  - name: "GCP"
    icon: "/tech-logos/gcp.svg"
  - name: "GitHub Actions"
    icon: "/tech-logos/github-actions.svg"
---

<!-- TODO: Daryl - replace placeholder with real project content -->

## Problem

Manual infrastructure management across multiple cloud providers (AWS, GCP) caused drift, slow deployments, and lack of reproducibility between environments.

## Solution

Unified Terraform repo with reusable modules, remote state in S3+GCS, and GitHub Actions pipelines that apply changes with `terraform plan --out` and merge gates.

## Stack

- Terraform 1.7+ with versioned modules
- AWS (S3, IAM, VPC) and GCP (GCS, IAM, VPC)
- GitHub Actions with OIDC for cloud auth
- Optional Atlantis for team collaboration

## Outcomes

- Provisioning time: hours → minutes
- Zero drift between environments (dev/staging/prod identical)
- Multi-region replication automated

## Links

- Repository: pending
- Demo: pending
