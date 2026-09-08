---
title: "Cloud Infrastructure Automation"
description: "Automatización de infraestructura multicloud con Terraform para reproducibilidad y velocidad de despliegue."
pubDate: 2026-09-07
lang: "es"
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

<!-- TODO: Daryl - reemplazar placeholder con contenido real del proyecto -->

## Problema

La gestión manual de infraestructura entre múltiples proveedores cloud (AWS, GCP) generaba drift, lentitud en despliegues y falta de reproducibilidad entre entornos.

## Solución

Repositorio Terraform unificado con módulos reutilizables, state remoto en S3+GCS, y pipelines GitHub Actions que aplican cambios con `terraform plan --out` y merge gates.

## Stack

- Terraform 1.7+ con módulos versionados
- AWS (S3, IAM, VPC) y GCP (GCS, IAM, VPC)
- GitHub Actions con OIDC para autenticación cloud
- Atlantis opcional para colaboración en equipo

## Resultados

- Tiempo de provisionamiento: de horas a minutos
- Cero drift entre entornos (dev/staging/prod idénticos)
- Replicación multi-región automatizada

## Links

- Repositorio: pendiente
- Demo: pendiente
