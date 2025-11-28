# 🚀 Deployment Guide - EasyAA Wallet

Guía completa para desplegar tu propia instancia de EasyAA Wallet.

## 📋 Prerequisitos

- Cuenta de Cloudflare (gratis)
- Node.js 18+ instalado
- Git
- Cuenta de GitHub (opcional, para CI/CD)

## 🎯 Opción 1: Cloudflare Pages (Recomendado)

### Paso 1: Setup Cloudflare

1. **Crea cuenta en Cloudflare**
   - Visita https://dash.cloudflare.com/sign-up
   - Verifica tu email

2. **Obtén API Token**
   ```bash
   # En tu terminal
   npx wrangler login
   # Se abrirá el navegador para autorizar
   ```

### Paso 2: Build y Deploy

```bash
# 1. Clona el repositorio
git clone https://github.com/your-repo/easyaa-wallet
cd easyaa-wallet

# 2. Instala dependencias
npm install

# 3. Build
npm run build

# 4. Deploy
npx wrangler pages deploy dist --project-name easyaa-wallet

# Recibirás:
# ✅ Production URL: https://easyaa-wallet.pages.dev
# ✅ Preview URL: https://main.easyaa-wallet.pages.dev
```

### Paso 3: Configurar Dominio (Opcional)

```bash
# Agregar dominio personalizado
npx wrangler pages domain add your-domain.com --project-name easyaa-wallet

# Configurar DNS:
# - Tipo: CNAME
# - Nombre: @
# - Valor: easyaa-wallet.pages.dev
```

## 🎯 Opción 2: Deploy Manual

### Usando GitHub Pages

```bash
# 1. Build
npm run build

# 2. Instala gh-pages
npm install -D gh-pages

# 3. Deploy
npx gh-pages -d dist
```

### Usando Vercel

```bash
# 1. Instala Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# Sigue las instrucciones interactivas
```

### Usando Netlify

```bash
# 1. Instala Netlify CLI
npm i -g netlify-cli

# 2. Deploy
netlify deploy --prod --dir=dist
```

## 🔐 Variables de Entorno

### Variables Necesarias

Para producción, configura estas variables:

```bash
# Cloudflare Pages Secrets
npx wrangler pages secret put PAYMASTER_PRIVATE_KEY --project-name easyaa-wallet
# Ingresa tu private key cuando te lo pida

# Opcionales (para bundlers premium)
npx wrangler pages secret put STACKUP_API_KEY
npx wrangler pages secret put PIMLICO_API_KEY
npx wrangler pages secret put ALCHEMY_API_KEY
```

### Archivo .env Local (Solo desarrollo)

```bash
# .env.local (NO COMMITEAR)
PAYMASTER_PRIVATE_KEY=0x...
STACKUP_API_KEY=your_key
PIMLICO_API_KEY=your_key
```

## 🗄️ Base de Datos (Cloudflare D1)

### Crear Database

```bash
# 1. Crear base de datos
npx wrangler d1 create easyaa-production

# Output:
# database_id = "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Actualizar wrangler.jsonc

```jsonc
{
  "name": "easyaa-wallet",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "easyaa-production",
      "database_id": "TU-DATABASE-ID-AQUI"
    }
  ]
}
```

### Crear Tablas

```bash
# 1. Crea archivo de migración
mkdir migrations
cat > migrations/0001_initial.sql << 'EOF'
CREATE TABLE accounts (
  email TEXT PRIMARY KEY,
  passkey_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  smart_account_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_address ON accounts(smart_account_address);
CREATE INDEX idx_accounts_chain ON accounts(chain_id);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_email TEXT NOT NULL,
  user_op_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_email) REFERENCES accounts(email)
);

CREATE INDEX idx_transactions_account ON transactions(account_email);
CREATE INDEX idx_transactions_hash ON transactions(user_op_hash);
EOF

# 2. Aplicar migraciones
npx wrangler d1 migrations apply easyaa-production
```

## 🔄 CI/CD con GitHub Actions

### .github/workflows/deploy.yml

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist --project-name=easyaa-wallet
```

### Setup GitHub Secrets

1. Ve a tu repositorio → Settings → Secrets
2. Agrega `CLOUDFLARE_API_TOKEN`
3. Valor: Tu API token de Cloudflare

## 🔧 Configuración Post-Deploy

### 1. Verificar Health Check

```bash
curl https://your-domain.com/api/health

# Expected:
# {
#   "status": "ok",
#   "service": "EasyAA Wallet API",
#   "version": "1.0.0"
# }
```

### 2. Probar Account Creation

```bash
curl -X POST https://your-domain.com/api/account/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "passkeyId": "test123",
    "passkeyPublicKey": "pk_test",
    "chainId": 11155111
  }'
```

### 3. Configurar Paymaster

Edita `src/routes/paymaster.ts` para ajustar límites:

```typescript
limits: {
  maxGasPerTransaction: '1000000',      // Ajusta según necesites
  dailyLimitPerUser: '10000000',        // Límite diario
  monthlyLimitPerUser: '100000000'      // Límite mensual
}
```

## 📊 Monitoreo

### Cloudflare Analytics

1. Ve a Cloudflare Dashboard
2. Selecciona tu proyecto
3. Ve a Analytics

Verás:
- Requests por día
- Bandwidth usado
- Errores
- Latencia

### Logs

```bash
# Ver logs en tiempo real
npx wrangler pages deployment tail --project-name=easyaa-wallet

# Ver logs de producción
npx wrangler pages deployment list --project-name=easyaa-wallet
```

### Custom Analytics

Agrega tracking en tu código:

```typescript
// src/lib/analytics.ts
export function trackEvent(event: string, data: any) {
  // Enviar a tu sistema de analytics
  console.log('Event:', event, data);
}
```

## 🔒 Seguridad

### HTTPS Automático
- Cloudflare Pages incluye HTTPS automáticamente
- Certificados SSL renovados automáticamente

### Configurar CORS

Edita `src/index.tsx`:

```typescript
app.use('/api/*', cors({
  origin: ['https://your-dapp.com'],
  methods: ['GET', 'POST'],
  credentials: true
}))
```

### Rate Limiting

```typescript
// src/middleware/rate-limit.ts
import { Hono } from 'hono'

export function rateLimitMiddleware() {
  const requests = new Map()
  
  return async (c, next) => {
    const ip = c.req.header('cf-connecting-ip') || 'unknown'
    const count = requests.get(ip) || 0
    
    if (count > 100) { // 100 requests por minuto
      return c.json({ error: 'Rate limit exceeded' }, 429)
    }
    
    requests.set(ip, count + 1)
    setTimeout(() => requests.delete(ip), 60000)
    
    await next()
  }
}
```

## 🔧 Troubleshooting

### Error: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Wrangler authentication failed"

```bash
# Re-login
npx wrangler logout
npx wrangler login
```

### Error: "Database not found"

```bash
# Verificar database ID en wrangler.jsonc
npx wrangler d1 info easyaa-production
```

### Build muy lento

```bash
# Usar cache de build
npm run build -- --mode production
```

## 📈 Optimizaciones

### 1. Edge Caching

```typescript
// Cachear responses estáticas
app.get('/api/config', (c) => {
  c.header('Cache-Control', 'public, max-age=3600')
  return c.json({...})
})
```

### 2. Minificación

Ya incluida en el build de Vite.

### 3. Code Splitting

```typescript
// Lazy load routes
const paymasterRoutes = await import('./routes/paymaster')
app.route('/api/paymaster', paymasterRoutes.default)
```

## 🌍 Multi-Region

Cloudflare Pages despliega automáticamente a 200+ regiones globalmente.

No necesitas configuración adicional.

## 💰 Costos Esperados

### Free Tier (hasta 100K requests/día)
```
Cloudflare Pages: $0
Cloudflare D1: $0 (hasta 5GB)
──────────────────
Total: $0/mes
```

### Paid (>500K requests/día)
```
Cloudflare Workers: $5/mes (10M requests)
Cloudflare D1: $5/mes (hasta 1TB)
──────────────────
Total: $10/mes
```

## 📚 Recursos Adicionales

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `npx wrangler pages deployment tail`
2. Verifica la configuración: `npx wrangler pages project list`
3. Abre un issue en GitHub
4. Únete a nuestro Discord

---

¡Felicidades! 🎉 Tu instancia de EasyAA Wallet está desplegada.
