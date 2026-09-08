---
title: "CI/CD Pipeline Design"
description: "Robust integration and deployment pipelines with GitHub Actions, auto-scaling runners, and multi-cloud deployments."
pubDate: 2026-09-07
lang: "en"
order: 3
featured: true
tags:
  - name: "GitHub Actions"
    icon: "/tech-logos/github-actions.svg"
  - name: "Argo CD"
  - name: "Docker"
    icon: "/tech-logos/docker.svg"
  - name: "Cloudflare"
---

<!-- TODO: Daryl - replace placeholder with real project content -->

## Problem

Slow pipelines, lack of isolation between jobs, saturated runners at peak hours, and manual deployments risking drift between environments.

## Solution

Actions Runner Controller (ARC) with auto-scaling to 0 when idle, distributed dependency caching, GitOps push-on-tag deployments into Argo CD.

## Stack

- GitHub Actions with ARC (Actions Runner Controller)
- Self-hosted runners on k3s, scaled 0-N
- Docker BuildKit with layer caching
- Cloudflare Pages + R2 for static frontends

## Outcomes

- Cold start of jobs: <30s (was 3+ min)
- Parallelism capacity: 50+ concurrent jobs
- Reproducible deploys: tag → production in <5 min

## Links

- Repository: pending
- Demo: pending
