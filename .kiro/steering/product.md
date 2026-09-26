# Product Steering — SIM Klinik Pratama Cikidang Medika

## 1. Product Vision & Identity
SIM Klinik Pratama Cikidang Medika is a high-performance web-based clinic management system serving the doctors, cashiers, nurses, and owners of Klinik Pratama Cikidang Medika. It replaces manual paper and fragmented spreadsheets with a tactile, reliable, and real-time operational platform.

## 2. Core Personas & Roles
- **Dokter (Clinical)**: Conducts consultations, examines vital signs, searches ICD-10 diagnoses, and prescribes medications quickly with minimal keystrokes.
- **Kasir (Financial / Administrative)**: Handles patient registration, queueing, billing calculation, cash tenders, change calculation, and receipt generation.
- **Pemilik / Owner (Executive)**: Monitors daily revenue, capitation payouts (BPJS ~Rp 28M/month), cash liquidity, morbidity trends, and exports financial summaries.

## 3. Design Source of Truth
The official design source of truth is codified in:
- `docs/design-system/01-DESIGN-FOUNDATION.md` — Tokens, Typography, Emil Kowalski Standards.
- `docs/design-system/02-COMPONENT-SPECIFICATIONS.md` — Detailed component interaction specifications.
- `docs/design-system/component-showcase.html` — Interactive reference implementation (Medical Sapphire palette, tactile cards, tabular numbers, area gradient sparklines).

## 4. Anti-Slop & Craft Governance
- **Zero Generic AI Slop**: Strict adherence to rules R-01 to R-38. No placeholder mock numbers; all metrics reflect genuine clinic data structures.
- **Typography**: Canonical font is **Plus Jakarta Sans** for interface text and **JetBrains Mono** for all numerical values (currency, counts, ICD-10 codes, queue tokens).
- **Tactile Physics**: Emil Kowalski standards (`cubic-bezier(0.2, 0, 0, 1)`, `:active { transform: scale(0.96); }`).
- **Concentric Radius**: `R_outer = R_inner + padding` across all containers and nested cards.
- **Responsive Guarantee**: 100% responsive across smartphones (360px–640px), tablets (768px–1024px), and desktops (1024px+). Zero horizontal page overflow.
