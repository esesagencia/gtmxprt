# Project Orchestration Guide (ECC Standards)

Welcome to the **core-solstice** workspace, now powered by **Everything Claude Code (ECC)**. This file serves as the main instruction set for how to work in this codebase.

## 🤖 Agent Roles & Orchestration

Always leverage specialized agents for domain-specific tasks using their `/commands`:

- **Planner (`/plan`)**: Use **PROACTIVELY** for any feature request or complex refactor. Never start significant coding without an implementation plan.
- **Architect (`/architect`)**: Consult for system design, scalability, and structural decisions.
- **TDD Guide (`/tdd`)**: Use for all new implementation work. 80%+ test coverage is mandatory.
- **Code Reviewer (`/review`)**: Trigger after every significant set of changes. Resolve all HIGH/CRITICAL issues before proceeding.
- **Security Reviewer**: Critical for any changes involving authentication, data privacy, or external inputs.

## 🧪 Testing Requirements

- **Minimum coverage: 80%**
- **Unit tests**: Individual functions & components.
- **Integration tests**: API endpoints and database operations.
- **E2E tests**: Critical user flows using Playwright.
- **Workflow**: Red-Green-Refactor is the default standard.

## 🔐 Eses Security Protocol (OBLIGATORIO)

Todos los proyectos Eses siguen el protocolo de seguridad de 4 pilares. Usar `/security-init` al arrancar un proyecto nuevo para desplegarlo automáticamente.

| Pilar | Regla | Skill |
|-------|-------|-------|
| **Edge Functions** | API keys de terceros → Supabase Edge Functions + Secrets. Nunca en Next.js env vars. | `eses-security-protocol` |
| **Input Sanitization** | Todo input externo validado con Zod antes de procesarse. Schemas en `lib/validators/`. | `eses-security-protocol` |
| **Supabase Auth** | No custom auth. Middleware protege rutas. RLS activo en todas las tablas. | `eses-security-protocol` |
| **Rate Limiting** | `applyRateLimit()` en todas las API routes. Upstash Redis. Perfiles: standard/expensive/auth. | `eses-security-protocol` |

> 📖 Protocolo completo: `.agents/skills/eses-security-protocol/SKILL.md`

### Reglas rápidas
- **No Secrets en código**: Nunca hardcodear API keys. Supabase Secrets para edge functions, `.env.local` para local.
- **Validation**: Zod en todas las fronteras (API routes, edge functions, form handlers).
- **Least Privilege**: RLS en Supabase, `requireAuth()` helper en routes protegidas.
- **Rate Limiting**: Upstash Redis — obligatorio en producción.

## 📂 Project Structure

- `.agents/skills/`: 50+ specialized domain knowledge sources.
- `.agents/workflows/`: Executable agent roles and guides.
- `everything-claude-code/`: Reference repository (source of truth).

## 🛠️ Development Workflow

1. `/plan` -> Create and approve implementation plan.
2. `/tdd` -> Implement features with tests.
3. `/review` -> Check for quality and standards.
4. `/verify` -> Run full test suite and validation.

---
*Powered by [Everything Claude Code](https://github.com/esesagencia/everything-claude-code)*
