# 📋 TODO Visual - Capsulas Framework

## 🎯 Estado Actual vs. Objetivo

```
┌─────────────────────────────────────────────────────────┐
│                   ESTADO ACTUAL                         │
├─────────────────────────────────────────────────────────┤
│ ✅ 23/23 Cápsulas implementadas                         │
│ ✅ ~10,000 líneas de código                             │
│ ✅ 8 archivos por cápsula                               │
│ ✅ Documentación completa                               │
│ ✅ 2 apps de ejemplo                                    │
│ ✅ Visual Editor corriendo                              │
│                                                          │
│ ❌ 0 tests                                              │
│ ❌ Sin build de TypeScript                              │
│ ❌ No publicado en NPM                                  │
│ ❌ Sin CI/CD                                            │
│ ❌ Sin CLI tool                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔴 LO CRÍTICO (Hacer Ya)

### 1. Testing Suite ❌

```
Estado: 🔴 BLOQUEANTE
Tiempo: 3-5 días
Impacto: CRÍTICO

packages/capsules/src/
├── payments/
│   └── __tests__/
│       ├── service.test.ts      ❌
│       ├── adapters.test.ts     ❌
│       ├── utils.test.ts        ❌
│       └── errors.test.ts       ❌
├── oauth/
│   └── __tests__/
│       ├── service.test.ts      ❌
│       └── ...                  ❌
└── ... (6 cápsulas más)

Total tests necesarios: ~180 tests
Cobertura objetivo: 80%+
```

**Comandos para empezar**:
```bash
npm install --save-dev vitest @vitest/ui
mkdir -p packages/capsules/src/payments/__tests__
# Copiar template de test
npm test
```

---

### 2. TypeScript Build ❌

```
Estado: 🔴 BLOQUEANTE
Tiempo: 1 día
Impacto: CRÍTICO

Archivos necesarios:
├── packages/capsules/
│   ├── tsconfig.json           ❌
│   ├── dist/                   ❌ (generado por build)
│   │   ├── payments/
│   │   │   ├── index.js
│   │   │   ├── index.d.ts
│   │   │   └── ...
│   │   └── ...
│   └── package.json            ⚠️  (actualizar)
```

**Comandos para empezar**:
```bash
# Crear tsconfig.json
cat > packages/capsules/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "declaration": true,
    "outDir": "./dist",
    "strict": true
  }
}
EOF

# Agregar script
npm pkg set scripts.build="tsc"

# Build
npm run build
```

---

### 3. NPM Publishing ❌

```
Estado: 🔴 BLOQUEANTE
Tiempo: 2 días
Impacto: CRÍTICO

Checklist:
[ ] package.json completo
[ ] .npmignore configurado
[ ] LICENSE file
[ ] README.md pulido
[ ] Versioning (1.0.0)
[ ] NPM account
[ ] Test publish (dry-run)
[ ] Publish real
```

**Comandos**:
```bash
# Dry run
npm publish --dry-run

# Publish real
npm publish --access public
```

---

## 🟡 LO IMPORTANTE (Esta Semana)

### 4. CLI Tool ❌

```
Estado: 🟡 DESEABLE
Tiempo: 3-4 días
Impacto: ALTO

Estructura:
packages/cli/
├── src/
│   ├── commands/
│   │   ├── init.ts
│   │   ├── add.ts
│   │   └── generate.ts
│   ├── templates/
│   └── index.ts
└── bin/
    └── capsulas.js

Uso esperado:
$ npx @capsulas/cli init my-app
$ npx @capsulas/cli add payments
```

---

### 5. Documentation Website ❌

```
Estado: 🟡 DESEABLE
Tiempo: 5-7 días
Impacto: ALTO

Estructura:
docs/
├── .vitepress/
│   └── config.ts
├── index.md (homepage)
├── getting-started/
│   ├── installation.md
│   └── quick-start.md
├── capsules/
│   ├── payments.md
│   ├── oauth.md
│   └── ... (23 páginas)
└── examples/
    ├── ecommerce.md
    └── saas.md

Deploy: Vercel o Netlify
```

---

### 6. CI/CD Pipeline ❌

```
Estado: 🟡 DESEABLE
Tiempo: 2 días
Impacto: MEDIO-ALTO

.github/workflows/
├── test.yml          ❌ Test en cada PR
├── build.yml         ❌ Build verification
├── publish.yml       ❌ Auto-publish NPM
└── deploy-docs.yml   ❌ Deploy docs

Configurar:
[ ] GitHub Actions
[ ] Auto-test en PR
[ ] Auto-publish en tag
[ ] Dependabot
```

---

## 🟢 LO DESEABLE (Próximas Semanas)

### 7. VSCode Extension ❌
**Tiempo**: 4-5 días
**Impacto**: MEDIO

### 8. Performance Benchmarks ❌
**Tiempo**: 2-3 días
**Impacto**: BAJO-MEDIO

### 9. Storybook ❌
**Tiempo**: 3 días
**Impacto**: BAJO

### 10. Video Tutorials ❌
**Tiempo**: 5-7 días
**Impacto**: MEDIO

---

## 📊 Gráfico de Prioridades

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  IMPACTO                                               │
│    ↑                                                   │
│    │                                                   │
│    │  [1] Testing      [2] Build      [3] NPM         │
│    │      Suite            Config         Publish     │
│ A  │                                                   │
│ L  │                                                   │
│ T  │  [4] CLI Tool    [5] Docs         [6] CI/CD      │
│ O  │                     Website                       │
│    │                                                   │
│ M  │                                                   │
│ E  │  [7] VSCode      [8] Benchmarks   [9] Storybook  │
│ D  │      Extension                                    │
│ I  │                  [10] Videos                      │
│ O  │                                                   │
│    │                                                   │
│ B  │                                                   │
│ A  │                                                   │
│ J  │                                                   │
│ O  │                                                   │
│    └────────────────────────────────────────────────→  │
│         BAJO       MEDIO       ALTO      CRÍTICO       │
│                    URGENCIA                            │
└────────────────────────────────────────────────────────┘
```

---

## ⏱️ Timeline Visual

```
Semana 1: CRÍTICO
┌─────────────────────────────────────────────────────┐
│ Lun-Mar: Testing Suite (Payments, OAuth, State)    │
│ Mié-Jue: Testing Suite (Router, Theme, i18n)       │
│ Vie:     Testing Suite (Geo, Form-Builder)         │
└─────────────────────────────────────────────────────┘

Semana 2: CRÍTICO
┌─────────────────────────────────────────────────────┐
│ Lun-Mar: TypeScript Build + NPM Prep               │
│ Mié:     NPM Publish (dry-run y testing)           │
│ Jue-Vie: NPM Publish real + Docs update            │
└─────────────────────────────────────────────────────┘

Semana 3: IMPORTANTE
┌─────────────────────────────────────────────────────┐
│ Lun-Mié: CLI Tool development                      │
│ Jue-Vie: CLI Tool testing + release                │
└─────────────────────────────────────────────────────┘

Semana 4: IMPORTANTE
┌─────────────────────────────────────────────────────┐
│ Lun-Mié: Documentation Website                     │
│ Jue:     CI/CD Pipeline                            │
│ Vie:     Deploy + Marketing                        │
└─────────────────────────────────────────────────────┘

🎉 v1.0.0 RELEASE!
```

---

## 🎯 Objetivos por Version

### v1.0.0 (Semana 2) - MVP
```
✅ 23 cápsulas implementadas
❌ Tests (80%+)
❌ Build TypeScript
❌ NPM published
❌ Basic README
```

### v1.1.0 (Semana 4) - Enhanced
```
v1.0.0 +
❌ CLI tool
❌ Docs website
❌ CI/CD
❌ Integration tests
```

### v1.2.0 (Semana 6+) - Professional
```
v1.1.0 +
❌ VSCode extension
❌ Benchmarks
❌ Videos
❌ Storybook
```

---

## 📈 Métricas de Progreso

### Implementación
```
████████████████████████████████████████ 100% (23/23 cápsulas)
```

### Testing
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (0/180 tests)
```

### Tooling
```
█████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  12% (Visual Editor)
```

### Documentation
```
███████████████░░░░░░░░░░░░░░░░░░░░░░░░░  40% (READMEs only)
```

### Publishing
```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% (Not published)
```

---

## 🚀 Acción Inmediata Recomendada

```
┌──────────────────────────────────────────────────────┐
│  🎯 PRÓXIMO PASO: TESTING SUITE                     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. Instalar Vitest:                                │
│     $ npm install --save-dev vitest                 │
│                                                      │
│  2. Crear primer test:                              │
│     $ mkdir -p packages/capsules/src/payments/      │
│              __tests__                              │
│                                                      │
│  3. Escribir test básico:                           │
│     payments/service.test.ts                        │
│                                                      │
│  4. Correr test:                                    │
│     $ npm test                                      │
│                                                      │
│  ⏱️  Tiempo estimado: 2-3 horas para setup          │
│  📊 Impacto: Desbloquea todo lo demás               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📞 ¿Por Dónde Empiezo?

### Opción A: Solo lo Crítico (2 semanas)
```bash
# Semana 1: Testing
cd /Users/c/capsulas-framework
npm install --save-dev vitest
# Escribir ~180 tests

# Semana 2: Build & Publish
# Setup tsconfig
# Build
# Publish to NPM
```

### Opción B: Producción Completa (4 semanas)
```bash
# Semanas 1-2: Crítico (Testing, Build, NPM)
# Semana 3: CLI Tool
# Semana 4: Docs + CI/CD
```

### Opción C: Full Professional (6+ semanas)
```bash
# Todo lo anterior +
# VSCode extension
# Benchmarks
# Videos
# Community setup
```

---

## 🎓 Recursos

### Testing
- [Vitest Docs](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

### Publishing
- [NPM Guide](https://docs.npmjs.com/packages-and-modules)
- [Semantic Versioning](https://semver.org/)

### CLI
- [Commander.js](https://github.com/tj/commander.js)
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

---

**Última actualización**: 27 de Octubre, 2025
**Estado**: Implementación 100% ✅, Producción 0% ❌
**Próxima acción**: Testing Suite 🧪
