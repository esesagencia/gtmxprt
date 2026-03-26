---
name: eses-security-protocol
description: >
  Protocolo de seguridad estándar para todos los proyectos Eses. Aplica automáticamente
  cuando se arranca un proyecto nuevo o cuando se toca código relacionado con: API routes,
  autenticación, inputs de usuario, llamadas a APIs externas, o acceso a base de datos.
  Cubre los 4 pilares: Edge Functions, Input Sanitization, Supabase Auth, y Rate Limiting.
origin: ESES
version: 1.0.0
---

# Eses Security Protocol

Este protocolo es **obligatorio** en todos los proyectos del ecosistema Eses.
Cuando arranques un proyecto nuevo, di `/security-init` para que Claude lo despliegue automáticamente.

---

## Los 4 Pilares

### 1. 🔐 Edge Functions — No Expongas API Keys

**La regla:** Ninguna API key de terceros (OpenAI, Stripe, Resend, etc.) debe estar en el cliente ni en las API routes de Next.js si puede evitarse. Las llamadas a servicios externos van a través de **Supabase Edge Functions**, donde la key vive en `Supabase Secrets`.

#### ❌ NUNCA Hacer Esto
```typescript
// apps/web/src/app/api/generate/route.ts
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) // Expuesto en Vercel env
const result = await openai.chat.completions.create(...)
```

#### ✅ El Patrón Correcto: Supabase Edge Function
```typescript
// supabase/functions/generate/index.ts
import OpenAI from 'npm:openai'

Deno.serve(async (req) => {
  const { prompt } = await req.json()

  // La key vive en Supabase Secrets — nunca en el repo
  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  })

  return new Response(JSON.stringify({ content: result.choices[0].message.content }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

```typescript
// apps/web/src/app/api/generate/route.ts — solo llama a la edge function
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = createServerClient()
  const { data, error } = await supabase.functions.invoke('generate', {
    body: await req.json()
  })
  if (error) return Response.json({ error: 'Service error' }, { status: 500 })
  return Response.json(data)
}
```

#### Cómo gestionar Secrets
```bash
# Añadir secret a Supabase (nunca al repo)
supabase secrets set OPENAI_API_KEY=sk-proj-xxxx

# Ver secrets (sin exponer valores)
supabase secrets list
```

#### Checklist
- [ ] Ninguna API key de tercero en `process.env` de Next.js (excepto Supabase URL/anon key)
- [ ] Todas las llamadas a OpenAI, Stripe, Resend, etc. → Supabase Edge Function
- [ ] `.env.local` en `.gitignore` y no committeado
- [ ] Supabase Secrets usados para keys sensibles en edge functions
- [ ] Variables de cliente (`NEXT_PUBLIC_*`) no contienen nunca datos privados

---

### 2. 🛡️ Input Sanitization — Zod en Todas las Fronteras

**La regla:** Todo input externo (body de POST, query params, form data) debe validarse con un schema Zod **antes** de procesarse. Sin excepciones.

#### Patrón Estándar para API Routes (Next.js 14 App Router)
```typescript
// lib/validators/session.ts
import { z } from 'zod'

export const CreateSessionSchema = z.object({
  project: z.string().min(1).max(200).trim(),
  mode: z.enum(['stepflow', 'trackflow']),
  steps: z.array(z.object({
    element_tag: z.string().max(50),
    page_url: z.string().url(),
    tracking_status: z.enum(['tracked', 'untracked']).optional()
  })).max(500) // Limitar el número de items para evitar DoS
})

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>
```

```typescript
// app/api/sessions/route.ts
import { CreateSessionSchema } from '@/lib/validators/session'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = CreateSessionSchema.safeParse(body)
  if (!result.success) {
    return Response.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  // result.data es ahora seguro y tipado
  const { project, mode, steps } = result.data
  // ...
}
```

#### Sanitizar HTML si se renderiza en el cliente
```typescript
import DOMPurify from 'isomorphic-dompurify'

// Solo cuando NECESITAS renderizar HTML de usuario
const SafeHTML = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target']
    })
  }} />
)
```

#### Checklist
- [ ] Todos los `req.json()` / `req.formData()` validados con Zod antes de usar
- [ ] Schemas definidos en `lib/validators/` — no inline en las routes
- [ ] Arrays con `.max()` para evitar payloads masivos
- [ ] Strings con `.trim()` + `.max()` siempre
- [ ] No usar `as` para hacer cast de inputs sin validar primero
- [ ] `safeParse` en lugar de `parse` en routes (no lanzar excepciones)

---

### 3. 🔑 Supabase Auth — No Ruedes Tu Propia Autenticación

**La regla:** Toda autenticación pasa por Supabase Auth. El middleware de Next.js protege las rutas. RLS activo en todas las tablas. **Nunca usar `localStorage` para tokens.**

#### Middleware Estándar (`middleware.ts`)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options: CookieOptions) => {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove: (name, options: CookieOptions) => {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas públicas — definir explícitamente
  const PUBLIC_ROUTES = ['/login', '/signup', '/auth', '/api/public']
  const isPublic = PUBLIC_ROUTES.some(r => request.nextUrl.pathname.startsWith(r))

  if (!isPublic && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
```

#### RLS en Supabase — Template de Migración
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_enable_rls.sql

-- 1. Activar RLS en TODAS las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;

-- 2. Policy básica: usuario solo ve sus propios datos
CREATE POLICY "users_own_profiles"
  ON public.profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "users_own_sessions"
  ON public.sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "sessions_own_steps"
  ON public.steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = steps.session_id
        AND sessions.user_id = auth.uid()
    )
  );

-- 3. Admin bypass (para service role key en edge functions)
-- La service role key ya bypasea RLS automáticamente
```

#### Verificar Auth en API Routes
```typescript
// lib/supabase/auth-guard.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { user, error: null }
}

// En cualquier API route protegida:
export async function POST(req: Request) {
  const { user, error } = await requireAuth()
  if (error) return error
  // user está garantizado aquí
}
```

#### Checklist
- [ ] Middleware activo en todas las rutas privadas
- [ ] RLS habilitado en todas las tablas de Supabase
- [ ] Tokens en cookies httpOnly — nunca `localStorage`
- [ ] `requireAuth()` helper en todas las API routes protegidas
- [ ] `createAdminClient()` (con SERVICE_ROLE_KEY) solo en server-side, nunca expuesto al cliente
- [ ] Magic link / OAuth configurado — no custom password auth si se puede evitar

---

### 4. ⚡ Rate Limiting — Proteger las API Routes de Abusos

**La regla:** Todas las API routes públicas o costosas tienen rate limiting. Usar **Upstash Redis** (gratis hasta 10k req/día) con el helper de `@upstash/ratelimit`.

#### Setup
```bash
npm install @upstash/ratelimit @upstash/redis
```

```bash
# En Vercel/local .env
UPSTASH_REDIS_REST_URL=https://....upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx
```

#### Helper Estándar (`lib/rate-limit.ts`)
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

// Perfiles de rate limiting por tipo de ruta
export const rateLimiters = {
  // Rutas estándar: 60 req / 1 minuto por IP
  standard: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m') }),
  // Rutas costosas (IA, upload): 10 req / 1 minuto por IP
  expensive: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m') }),
  // Auth: 5 intentos / 15 minutos por IP
  auth: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(5, '15 m') })
}

export function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

export async function applyRateLimit(
  req: NextRequest,
  limiter: keyof typeof rateLimiters = 'standard'
): Promise<NextResponse | null> {
  const ip = getIP(req)
  const { success, limit, remaining, reset } = await rateLimiters[limiter].limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(reset)
        }
      }
    )
  }
  return null // No bloqueado
}
```

#### Aplicar en API Routes
```typescript
// app/api/sessions/route.ts
import { applyRateLimit } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  // 1. Rate limiting PRIMERO
  const rateLimitResponse = await applyRateLimit(req, 'standard')
  if (rateLimitResponse) return rateLimitResponse

  // 2. Validación de input
  // 3. Auth check
  // 4. Lógica de negocio
}

// Para rutas costosas (IA, exports, uploads)
export async function POST(req: NextRequest) {
  const rateLimitResponse = await applyRateLimit(req, 'expensive')
  if (rateLimitResponse) return rateLimitResponse
  // ...
}
```

#### Alternativa sin Upstash (in-memory, solo para desarrollo)
```typescript
// Solo para desarrollo local — no usar en producción
const requestCounts = new Map<string, { count: number; reset: number }>()

export function simpleRateLimit(ip: string, max = 60, windowMs = 60000): boolean {
  const now = Date.now()
  const entry = requestCounts.get(ip)
  if (!entry || entry.reset < now) {
    requestCounts.set(ip, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}
```

#### Checklist
- [ ] Upstash Redis configurado en el proyecto (URL + Token en `.env`)
- [ ] `applyRateLimit` aplicado en TODAS las API routes públicas
- [ ] Perfil `expensive` en rutas de IA, uploads, exports
- [ ] Perfil `auth` en rutas de login/signup/magic-link
- [ ] Headers `X-RateLimit-*` devueltos en las respuestas
- [ ] Rate limiting testeado (`npm run test:rate-limit`)

---

## Comando de Arranque: `/security-init`

Cuando el usuario diga `/security-init` en un proyecto nuevo, Claude debe:

1. **Verificar** que existe `middleware.ts` con la config de Supabase Auth descrita arriba
2. **Crear** `lib/validators/` con un schema Zod base según el dominio del proyecto
3. **Crear** `lib/rate-limit.ts` con el helper de Upstash
4. **Crear** `lib/supabase/auth-guard.ts` con el helper `requireAuth()`
5. **Verificar** `.gitignore` incluye `.env*`
6. **Verificar** que no hay API keys hardcodeadas (`grep -r "sk-" src/` etc.)
7. **Generar** la migración SQL de RLS base para las tablas del proyecto
8. **Mostrar** el checklist completo de los 4 pilares

---

## Pre-Deploy Security Checklist

Antes de cualquier deploy a producción:

- [ ] **Pilar 1 — Edge Functions**: Ninguna API key de tercero en Next.js env vars
- [ ] **Pilar 2 — Inputs**: Todos los endpoints con Zod schema
- [ ] **Pilar 3 — Auth**: Middleware activo, RLS en todas las tablas, `requireAuth()` en routes protegidas
- [ ] **Pilar 4 — Rate Limiting**: `applyRateLimit()` en todas las routes públicas
- [ ] **Extras**: No stack traces en errores de cliente, no logs de datos sensibles, HTTPS enforced
- [ ] **Dependencias**: `npm audit` limpio antes del deploy

---

## Stack de Referencia

Este protocolo está optimizado para:
- **Framework**: Next.js 14+ (App Router)
- **Auth + DB**: Supabase (Auth, Edge Functions, RLS)
- **Validation**: Zod
- **Rate Limiting**: Upstash Redis + `@upstash/ratelimit`
- **Deploy**: Vercel

Adaptar `applyRateLimit` y los patterns de edge functions si el stack es diferente.
