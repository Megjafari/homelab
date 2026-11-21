<p align="center">
  <img src="docs/readme-banner.svg" alt="homelab: self-hosted Kubernetes, GitOps and infrastructure as code" width="100%" />
</p>

<p align="center">
  A self-hosted Kubernetes homelab described as code and operated through Git —
  GitOps with Argo CD, host configuration with Ansible, CI that lints, validates
  and scans every change, and the blog that documents it, built from Markdown in
  the same repository.
</p>

<p align="center">
  <a href="https://github.com/Megjafari/homelab/actions/workflows/validate.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/Megjafari/homelab/validate.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=Validate" alt="Validate" />
  </a>
  <a href="https://github.com/Megjafari/homelab/actions/workflows/blog-ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/Megjafari/homelab/blog-ci.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=Blog%20CI" alt="Blog CI" />
  </a>
  <a href="https://blog.meghdadjafari.dev">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Fblog.meghdadjafari.dev&style=for-the-badge&label=Blog&up_message=online&down_message=offline" alt="Blog status" />
  </a>
  <img src="https://img.shields.io/github/last-commit/Megjafari/homelab?style=for-the-badge" alt="Last commit" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes" />
  <img src="https://img.shields.io/badge/Argo_CD-GitOps-EF7B4D?style=for-the-badge&logo=argo&logoColor=white" alt="Argo CD" />
  <img src="https://img.shields.io/badge/Ansible-EE0000?style=for-the-badge&logo=ansible&logoColor=white" alt="Ansible" />
  <img src="https://img.shields.io/badge/Proxmox-E57000?style=for-the-badge&logo=proxmox&logoColor=white" alt="Proxmox" />
  <img src="https://img.shields.io/badge/Renovate-1A1F6C?style=for-the-badge&logo=renovate&logoColor=white" alt="Renovate" />
  <img src="https://img.shields.io/badge/Tailscale-242424?style=for-the-badge&logo=tailscale&logoColor=white" alt="Tailscale" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [What this demonstrates](#what-this-demonstrates)
- [How a change reaches the cluster](#how-a-change-reaches-the-cluster)
- [Networking](#networking)
- [What it runs](#what-it-runs)
- [Rebuilding the cluster](#rebuilding-the-cluster)
- [Lessons from running it](#lessons-from-running-it)
- [Known gaps](#known-gaps)
- [Repository layout](#repository-layout)
- [Documentation](#documentation)
- [Design principles](#design-principles)

---

## Overview

I built this to learn what happens to an application after the code is written: where it runs, how it is reached, how the machines under it are managed, and what breaks. This repository is the source of truth for the hosts, the cluster workloads, the CI around them and the blog at [blog.meghdadjafari.dev](https://blog.meghdadjafari.dev). Everything here is what is actually running.

| Machine | Role |
| --- | --- |
| ThinkPad T430s | Proxmox host: OPNsense, Coolify and a PostgreSQL container |
| Intel NUC `nuke` | Kubernetes control plane |
| Self-built server `tank` | Kubernetes worker with an RTX 3060, and the NFS storage (two disks in RAID 1) |

## Architecture

```mermaid
flowchart TD
    Internet["Internet"] --> CF["Cloudflare<br/>DNS, TLS, Tunnel"]
    Internet --> OPN["OPNsense<br/>router and firewall"]

    subgraph PVE["Proxmox on a ThinkPad T430s"]
        OPN
        Coolify["Coolify VM<br/>blog and other apps"]
        PG[("PostgreSQL<br/>LXC")]
    end

    OPN -->|"VLAN trunk"| SW["Managed switch"]
    CF -->|"tunnel"| Coolify
    SW --> nuke["nuke<br/>Intel NUC<br/>control plane"]
    SW --> tank["tank<br/>worker, RTX 3060<br/>NFS storage, RAID 1"]

    GH["GitHub<br/>this repository"] -.->|"Argo CD"| nuke
    nuke --- K8s["Kubernetes<br/>Jellyfin, Immich, Nextcloud,<br/>Vaultwarden, Home Assistant, ..."]
    tank --- K8s
    GH -.->|"build and deploy"| Coolify
```

Each layer has one owner:

| Layer | Responsibility | Lives in |
| --- | --- | --- |
| Network | Routing, firewall, VLANs | OPNsense, D-Link AP |
| Hosts | Packages, swap, CNI, NVIDIA driver | [`ansible/`](./ansible/) |
| Cluster | Bootstrap and membership | `kubeadm`, [`docs/cluster-components.md`](./docs/cluster-components.md) |
| Workloads | Everything that runs in Kubernetes | [`apps/`](./apps/), [`argocd/`](./argocd/) |
| Content | The blog and its posts | [`blog/`](./blog/), [`content/`](./content/) |

Ansible stops at the host boundary; Argo CD owns everything inside the cluster.

## What this demonstrates

| Skill | Where to look |
| --- | --- |
| **GitOps** with Argo CD, app-of-apps, one Application per namespace | [`argocd/`](./argocd/), [`apps/`](./apps/) |
| **Kubernetes** on bare metal with `kubeadm`, NFS-backed storage, GPU scheduling | [`apps/`](./apps/), [`docs/cluster-components.md`](./docs/cluster-components.md) |
| **Configuration management** with Ansible, linted in CI | [`ansible/`](./ansible/) |
| **Secrets handling**: Sealed Secrets in Git, key backup and recovery, secret scanning in CI | [`docs/backup.md`](./docs/backup.md), [`.gitleaks.toml`](./.gitleaks.toml) |
| **CI**: YAML lint, schema validation, kube-linter, Ansible lint, gitleaks | [`.github/workflows/validate.yml`](./.github/workflows/validate.yml) |
| **Dependency hygiene**: images pinned by digest, Renovate on a weekly schedule | [`renovate.json`](./renovate.json) |
| **Networking**: VLAN segmentation with OPNsense, Tailscale for private access, Cloudflare Tunnel for public services | [Networking](#networking) |
| **Posts as code**: Markdown in Git, built into a static site and deployed | [`content/`](./content/), [`blog/`](./blog/) |

## How a change reaches the cluster

```mermaid
flowchart LR
    A["Edit manifests<br/>in a branch"] --> B["Pull request"]
    B --> C["CI: lint, validate,<br/>scan for secrets"]
    C --> D["Merge to main"]
    D --> E["Argo CD syncs<br/>apps/ to the cluster"]
    R["Renovate"] -.->|"opens PRs for<br/>new image digests"| B
```

Workloads are changed through Git, not with `kubectl`. Argo CD applies `apps/<namespace>/` into the namespace of the same name. Automated sync is on, with `prune` and `selfHeal` off for now, so nothing is deleted without a conscious step.

## Networking

OPNsense provides routing, firewalling and segmentation. VLAN 30 carries the homelab, and the access point trunks the Main, IoT and Guest VLANs.

```mermaid
flowchart TD
    Internet["Internet<br/>Tele2 modem"] --> OPN["OPNsense<br/>192.168.1.1"]
    OPN -->|"Tagged trunk: all VLANs"| SW["Managed switch"]
    SW -->|"VLAN 30"| Lab
    SW -->|"Tagged trunk: Main, IoT, Guest"| AP["D-Link DAP-2680<br/>access point"]
    subgraph Lab["Homelab"]
        tank["tank<br/>worker"]
        nuke["nuke<br/>control plane"]
    end
    AP -.->|"VLAN 20"| IoT
    AP -.->|"VLAN 10"| Main
    AP -.->|"VLAN 40"| Guest["SSID Guest"]
    subgraph IoT["SSID IoT"]
        plug["Smart plug"]
        cam["Cameras"]
        tv["TV"]
    end
    subgraph Main["SSID Main"]
        thinkpad["Thinkpad"]
        iphone["iPhone"]
    end
```

The blog is published through a Cloudflare Tunnel, so no router ports are forwarded for it. Everything else is reached over Tailscale.

## What it runs

Jellyfin (with GPU transcoding), Immich, Nextcloud, Vaultwarden, Home Assistant, Navidrome, the Sonarr/Radarr/Prowlarr stack with qBittorrent behind a VPN sidecar, Prometheus, Grafana, Uptime Kuma and a Homepage dashboard.

## Rebuilding the cluster

The repository is meant to be enough to rebuild from. In short:

1. Hosts: Ansible, then `kubeadm init` and `join` ([`ansible/`](./ansible/)).
2. Flannel, Argo CD and the Sealed Secrets controller ([`docs/cluster-components.md`](./docs/cluster-components.md)).
3. Restore the Sealed Secrets key ([`docs/backup.md`](./docs/backup.md)).
4. `kubectl apply -f argocd/root.yaml`, and Argo CD recreates every Application.

Application data is a separate concern and is not covered yet (see [Known gaps](#known-gaps)).

## Lessons from running it

These are real problems, now fixed in the manifests:

- **A rolling update can deadlock on a single GPU.** Jellyfin requests the node's only GPU, so the new pod stayed `Pending` for hours while the old pod held it. Fix: `strategy: Recreate`.
- **Databases lock their data directory.** During a rolling update the new database and Prometheus pods crash-looped on the lock held by the old pod, so the rollout never finished. Fix: `Recreate` on every single-replica app with a PVC.
- **`:latest` makes Git history meaningless.** Every image is now pinned by digest, which makes rollbacks real and gives Renovate something to update.
- **A secret scanner must understand sealed secrets.** Gitleaks flagged the encrypted values in `sealed-secret.yaml`; they are ciphertext, so those files are allow-listed explicitly rather than turning the check off.
- **Wi-Fi interference was real.** Moving from a 2.4 GHz-only access point to a dual-band one fixed it.

More detail goes into the [blog](https://blog.meghdadjafari.dev).

## Known gaps

Stated plainly, because a portfolio should not pretend:

- Only the Sealed Secrets key has a backup procedure. Application data on NFS has no off-host backup yet.
- No NetworkPolicies (the CNI is Flannel), so pods can reach each other freely.
- Most workloads still run with their image's default user (often root); only Grafana and Prometheus have a hardened `securityContext`.
- Services are exposed as `NodePort`; there is no ingress controller yet.
- `kube-linter` runs as an advisory check, because the findings above are not fixed yet.
- Argo CD `prune` and `selfHeal` are off.
- Terraform manages the GitHub repository and the Cloudflare DNS zone ([`terraform/`](./terraform/)); Proxmox is planned.

## Repository layout

```text
.
├── .github/workflows/   # CI: validate.yml (manifests, Ansible, secrets), blog and portfolio builds
├── ansible/             # Host configuration
├── apps/                # Kubernetes workloads, one directory per namespace
├── argocd/              # Argo CD Applications (app-of-apps)
├── blog/                # The blog frontend (React, Vite)
├── portfolio/           # The portfolio site (React, deployed on Vercel)
├── content/             # Blog posts as Markdown, built into the site
├── docs/                # Backup and cluster component documentation
├── scripts/             # Helper scripts
├── terraform/           # Infrastructure as code (GitHub, Cloudflare DNS; Proxmox planned)
├── .gitleaks.toml       # Secret scanning rules
└── renovate.json        # Automated dependency updates
```

## Documentation

- [`ansible/`](./ansible/) – host configuration and node recovery
- [`apps/`](./apps/) – workloads, storage and operations
- [`argocd/`](./argocd/) – Applications and the rebuild order
- [`docs/backup.md`](./docs/backup.md) – Sealed Secrets key backup and restore
- [`docs/cluster-components.md`](./docs/cluster-components.md) – hand-installed components and versions
- [`terraform/github/`](./terraform/github/) – repository settings as code
- [`terraform/cloudflare/meghdadjafari-dev/`](./terraform/cloudflare/meghdadjafari-dev/) – DNS records as code
- [`blog/README.md`](./blog/README.md) – how a post is published
- [`portfolio/README.md`](./portfolio/README.md) – the portfolio site

## Design principles

- **Declarative.** Describe the desired state; avoid undocumented manual changes.
- **Git as the source of truth.** Changes are reviewed, reverted and audited through history.
- **Separated responsibilities.** Each layer owns one thing.
- **Reproducible.** The repository should contain enough to rebuild the environment. Data backups are a separate concern.

## License

The code in this repository is licensed under the [Apache License 2.0](./LICENSE).

Blog posts and their images in [`content/`](./content/) are © Meghdad Jafari, all rights reserved, and are not covered by that license.
