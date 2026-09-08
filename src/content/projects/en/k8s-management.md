---
title: "K8s Cluster Management"
description: "Design and operation of multi-cloud Kubernetes clusters (EKS, GKE, AKS) with GitOps and observability."
pubDate: 2026-09-07
lang: "en"
order: 2
featured: true
tags:
  - name: "Kubernetes"
    icon: "/tech-logos/kubernetes.svg"
  - name: "Docker"
    icon: "/tech-logos/docker.svg"
  - name: "Helm"
    icon: "/tech-logos/helm.svg"
  - name: "Argo CD"
---

<!-- TODO: Daryl - replace placeholder with real project content -->

## Problem

Heterogeneous Kubernetes clusters (managed and self-hosted) lacking a unified deployment, configuration, and observability pattern. Manual changes, scattered secrets, and unpredictable restores.

## Solution

Reproducible bootstrap with `k3s`/`eksctl`, end-to-end GitOps with Argo CD (App-of-Apps), sealed secrets with Bitnami SealedSecrets and External Secrets Operator into Vault.

## Stack

- Kubernetes 1.30 (EKS, GKE, self-hosted k3s)
- Argo CD 2.10+ with App-of-Apps and Sync Waves
- Helm 3 + Kustomize for manifests
- VictoriaMetrics + Grafana for observability

## Outcomes

- 10+ production clusters under declarative management
- Recovery time objective (RTO): <30 min from Git
- Kubernetes upgrade from hours to ~10 min with synced waves

## Links

- Repository: pending
- Demo: pending
