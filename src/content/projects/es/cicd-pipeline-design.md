---
title: "CI/CD Pipeline Design"
description: "Pipelines de integración y despliegue continuo robustos con GitHub Actions, runners auto-escalados y despliegues multi-cloud."
pubDate: 2026-09-07
lang: "es"
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

<!-- TODO: Daryl - reemplazar placeholder con contenido real del proyecto -->

## Problema

Pipelines lentos, falta de aislamiento entre jobs, runners saturados en horas pico y despliegues manuales con riesgo de drift entre entornos.

## Solución

Actions Runner Controller (ARC) con auto-scaling a 0 cuando idle, caché distribuido de dependencias, despliegues GitOps push desde tag release hacia Argo CD.

## Stack

- GitHub Actions con ARC (Actions Runner Controller)
- Runners self-hosted en k3s, escalado 0-N
- Docker BuildKit con layer caching
- Cloudflare Pages + R2 para frontend estático

## Resultados

- Cold start de jobs: <30s (era 3+ minutos)
- Capacidad de paralelismo: 50+ jobs concurrentes
- Despliegues reproducibles: tag → production en <5 min

## Links

- Repositorio: pendiente
- Demo: pendiente
