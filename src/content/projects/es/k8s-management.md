---
title: "K8s Cluster Management"
description: "Diseño y operación de clusters Kubernetes multi-cloud (EKS, GKE, AKS) con GitOps y observabilidad."
pubDate: 2026-09-07
lang: "es"
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

<!-- TODO: Daryl - reemplazar placeholder con contenido real del proyecto -->

## Problema

Clusters Kubernetes heterogéneos (managed y self-hosted) sin un patrón unificado de despliegue, configuración y observabilidad. Cambios manuales, secretos dispersos, y restores impredecibles.

## Solución

Bootstrap reproducible con `k3s`/`eksctl`, GitOps end-to-end con Argo CD (App-of-Apps), secrets sealed con Bitnami SealedSecrets y External Secrets Operator hacia Vault.

## Stack

- Kubernetes 1.30 (EKS, GKE, self-hosted k3s)
- Argo CD 2.10+ con App-of-Apps y Sync Waves
- Helm 3 + Kustomize para manifests
- VictoriaMetrics + Grafana para observabilidad

## Resultados

- 10+ clusters productivos bajo gestión declarativa
- Recover time objective (RTO): <30 min desde Git
- Cluster upgrade de Kubernetes de horas a ~10 min con synced waves

## Links

- Repositorio: pendiente
- Demo: pendiente
