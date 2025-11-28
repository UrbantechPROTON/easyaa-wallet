# 🚀 EasyAA Wallet - Open Source Account Abstraction

**La alternativa superior y económica a Human Wallet**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 🎯 ¿Qué es EasyAA Wallet?

Una solución completa de **Account Abstraction (ERC-4337)** que permite a cualquier dApp ofrecer wallets "tipo banco" sin:
- ❌ MetaMask
- ❌ Seed phrases visibles
- ❌ Pago de gas por el usuario
- ❌ Extensiones de navegador
- ❌ Costos de suscripción mensuales

**Solo necesitas:** Email o biometría (FaceID, huella digital)

## 🏆 Ventajas vs Human Wallet

| Característica | Human Wallet | EasyAA (Nosotros) |
|---------------|--------------|-------------------|
| **Costo mensual** | $XXX por MAT | **$0-5 (solo infra)** |
| **Open Source** | ❌ No | ✅ Sí (MIT) |
| **Self-hosted** | ❌ No | ✅ Sí |
| **Vendor lock-in** | ⚠️ Sí | ✅ No |
| **Control total** | ❌ Limitado | ✅ Completo |
| **Multi-chain** | ✅ Sí | ✅ Sí |
| **Passkeys nativos** | ✅ Sí | ✅ Sí |
| **Gas sponsorship** | ✅ Sí | ✅ Configurable |

## 🚀 Demo en Vivo

**URL de la demo:**
🔗 https://3000-ij1s709raaed2vl2ix8ea-3844e1b6.sandbox.novita.ai

### Características Implementadas

✅ **Autenticación con Passkeys (WebAuthn)**
- Crea wallet con tu huella o FaceID
- Sin seed phrases que anotar
- Biometría nativa del dispositivo

✅ **Smart Contract Wallets (ERC-4337)**
- Wallets basadas en contratos inteligentes
- Recovery sin seed phrases
- Lógica personalizable

✅ **Gasless Transactions**
- API de Paymaster incluida
- Tú controlas los límites de gasto
- Usuario no paga gas directamente

✅ **Multi-Chain Ready**
- Ethereum, Polygon, Arbitrum, Base
- Misma infraestructura para todas las chains
- EntryPoint v0.7 en todas las redes

✅ **SDK Reutilizable**
- Integra en tu dApp en 5 minutos
- API simple y documentada
- React, Vue, vanilla JS compatible

## 📦 Estructura del Proyecto

```
webapp/
├── src/
│   ├── index.tsx              # Hono backend principal
│   ├── routes/
│   │   ├── account.ts         # Gestión de cuentas
│   │   ├── paymaster.ts       # Sponsorship de gas
│   │   └── bundler.ts         # Proxy a bundlers
│   ├── lib/
│   │   ├── sdk.ts             # SDK reutilizable
│   │   ├── passkey.ts         # Utilidades WebAuthn
│   │   └── bundler.ts         # Cliente bundler
│   └── types/
│       └── account.ts         # TypeScript types
├── public/
│   └── static/
│       └── app.js             # Frontend interactivo
├── contracts/
│   ├── addresses.json         # Direcciones desplegadas
│   └── README.md              # Guía de contratos
├── SDK-INTEGRATION.md         # Guía de integración
└── README.md                  # Este archivo
```

## 🔧 Stack Tecnológico

### Backend
- **Hono** - Framework web ultra rápido
- **Cloudflare Workers** - Edge computing
- **TypeScript** - Tipado estático

### Frontend
- **WebAuthn API** - Passkeys nativos
- **TailwindCSS** - Estilos modernos
- **Vanilla JS** - Sin dependencias pesadas

### Blockchain
- **ERC-4337** - Account Abstraction estándar
- **viem** - Librería Ethereum moderna
- **permissionless.js** - SDK para AA

### Infraestructura
- **Cloudflare Pages** - Hosting gratis/económico
- **Stackup/Pimlico** - Bundlers públicos
- **Public RPC nodes** - Sin API keys necesarios

## 🚀 Quick Start

### 1. Clona y Setup

```bash
git clone https://github.com/your-repo/easyaa-wallet
cd easyaa-wallet
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Desarrollo Local

```bash
# Con PM2 (recomendado)
pm2 start ecosystem.config.cjs

# O con wrangler directamente
npm run dev:sandbox
```

### 4. Testea

```bash
curl http://localhost:3000/api/health
```

### 5. Abre en navegador

```
http://localhost:3000
```

## 📱 Uso de la Aplicación

### Crear Wallet

1. Ingresa tu email
2. Click en "Create Wallet with Passkey"
3. Autoriza con tu huella/FaceID
4. ¡Listo! Tu smart account está creado

### Ver tu Wallet

- **Dirección**: Se muestra en el dashboard
- **Balance**: Consulta saldo en Sepolia testnet
- **Transacciones**: Historial de operaciones

### Enviar Transacciones (Demo)

- Click en "Send Transaction (Demo)"
- La transacción es sponsoreada (gasless)
- No necesitas ETH para gas

## 🔌 Integración en Tu dApp

### Instalación

```bash
npm install easyaa-wallet-sdk
```

### Uso Básico

```javascript
import { EasyAASDK } from 'easyaa-wallet-sdk';

const wallet = new EasyAASDK({
  apiUrl: 'https://your-api.com',
  chainId: 11155111,
  paymasterEnabled: true
});

// Crear cuenta
const account = await wallet.createAccount('user@example.com');

// Enviar transacción gasless
const tx = await wallet.sendTransaction({
  to: '0x...',
  value: '0.01'
});
```

Ver **[SDK-INTEGRATION.md](./SDK-INTEGRATION.md)** para guía completa.

## 🔐 API Endpoints

### Account Management

```bash
# Crear cuenta
POST /api/account/create
{
  "email": "user@example.com",
  "passkeyId": "base64...",
  "passkeyPublicKey": "base64...",
  "chainId": 11155111
}

# Obtener cuenta
GET /api/account/:email
```

### Paymaster Service

```bash
# Sponsorear transacción
POST /api/paymaster/sponsor
{
  "userOperation": {...},
  "entryPoint": "0x...",
  "chainId": 11155111
}

# Configuración
GET /api/paymaster/config
```

### Bundler Proxy

```bash
# Enviar UserOperation
POST /api/bundler/send-userop
{
  "userOperation": {...},
  "entryPoint": "0x...",
  "chainId": 11155111
}

# Obtener receipt
GET /api/bundler/userop/:hash?chainId=11155111
```

### Health Check

```bash
GET /api/health
```

## 🌐 Redes Soportadas

| Red | Chain ID | Estado |
|-----|----------|--------|
| Ethereum Sepolia | 11155111 | ✅ Activo |
| Polygon | 137 | ✅ Activo |
| Arbitrum | 42161 | ✅ Activo |
| Base | 8453 | ✅ Activo |
| Optimism | 10 | ✅ Activo |

**EntryPoint v0.7**: `0x0000000071727De22E5E9d8BAf0edAc6f37da032` (todas las redes)

## 💰 Costos Reales

### Infraestructura
- **Cloudflare Workers**: $5/mes (10M requests)
- **Cloudflare D1**: Gratis (5GB)
- **Bundlers públicos**: Gratis (con límites)
- **Total**: **~$5/mes** o menos

### Gas Sponsorship
- **Tú decides cuánto sponsorear**
- Configurable por usuario/transacción
- Puedes establecer límites diarios/mensuales
- Promedio: ~$0.01 por tx en L2s

### Comparación con Human Wallet
- **Human Wallet**: $XXX/mes por X MAT + lock-in
- **EasyAA**: $5/mes + gas que tú controlas + 100% open source

## 🔒 Seguridad

### Passkeys (WebAuthn)
- Claves privadas nunca salen del dispositivo
- Biometría nativa (FaceID, TouchID, Windows Hello)
- Estándar FIDO2 / WebAuthn
- Resistente a phishing

### Smart Contract Wallets
- Basado en contratos auditados (eth-infinitism)
- ERC-4337 estándar de la industria
- Recovery sin seed phrases
- Multi-sig posible

### Account Abstraction
- Sin exposición de claves privadas
- Paymaster verificable on-chain
- Bundlers descentralizados
- EntryPoint oficial

## 📚 Documentación

- **[SDK Integration Guide](./SDK-INTEGRATION.md)** - Integra en tu dApp
- **[Smart Contracts](./contracts/README.md)** - Guía de contratos
- **[API Reference](#-api-endpoints)** - Endpoints disponibles

## 🛠️ Desarrollo

### Requisitos
- Node.js 18+
- npm o pnpm
- Git

### Scripts Disponibles

```bash
npm run dev              # Desarrollo local (Vite)
npm run dev:sandbox      # Dev con Wrangler (port 3000)
npm run build            # Build producción
npm run preview          # Preview build
npm run deploy           # Deploy a Cloudflare Pages
npm run clean-port       # Limpiar puerto 3000
npm test                 # Test con curl
```

### PM2 Commands

```bash
pm2 start ecosystem.config.cjs  # Iniciar
pm2 logs easyaa-wallet          # Ver logs
pm2 restart easyaa-wallet       # Reiniciar
pm2 delete easyaa-wallet        # Detener
pm2 list                        # Listar servicios
```

## 🚀 Deploy a Producción

### Cloudflare Pages

```bash
# 1. Build
npm run build

# 2. Deploy
npx wrangler pages deploy dist --project-name easyaa-wallet

# Obtendrás URLs:
# Production: https://easyaa-wallet.pages.dev
# Preview: https://main.easyaa-wallet.pages.dev
```

### Variables de Entorno

Para producción, configura:

```bash
# API Keys (opcional)
npx wrangler secret put STACKUP_API_KEY
npx wrangler secret put PIMLICO_API_KEY

# Configuración
npx wrangler secret put PAYMASTER_PRIVATE_KEY
```

## 🎯 Casos de Uso

### ✅ Perfecto Para:
- NFT marketplaces
- DeFi apps con onboarding simple
- Gaming/metaverse apps
- dApps con usuarios web2
- Aplicaciones educativas blockchain

### ⚠️ No Recomendado Para:
- Trading de alta frecuencia
- Apps que necesitan control total de gas pricing
- Casos donde el usuario DEBE tener seed phrase

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Roadmap

- [x] Backend Hono con API completa
- [x] Frontend con Passkeys funcional
- [x] SDK reutilizable
- [x] Documentación completa
- [ ] Tests unitarios y e2e
- [ ] Cloudflare D1 para persistencia
- [ ] Recovery social
- [ ] Multi-sig wallets
- [ ] Mobile SDK (React Native)
- [ ] Dashboard de analytics

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

**100% Open Source** - Sin vendor lock-in, sin costos ocultos.

## 🙏 Créditos

Basado en estándares de:
- [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) - Account Abstraction
- [eth-infinitism](https://github.com/eth-infinitism/account-abstraction) - Implementación de referencia
- [WebAuthn](https://webauthn.guide/) - Passkeys estándar

## 📧 Contacto

- **GitHub**: [Your GitHub](https://github.com/your-username)
- **Twitter**: [@YourTwitter](https://twitter.com/your-twitter)
- **Discord**: [Join Server](https://discord.gg/your-server)

---

**Construido con ❤️ usando Hono, Cloudflare Workers, y Account Abstraction**

¿Te gusta el proyecto? Dale una ⭐ en GitHub!
