# EasyAA Smart Contracts

## Account Abstraction (ERC-4337) Implementation

Este directorio contiene los contratos inteligentes para el sistema de Account Abstraction.

### Contratos Principales:

1. **SimpleAccount.sol** - Smart Contract Wallet compatible con ERC-4337
2. **SimpleAccountFactory.sol** - Factory para crear nuevas wallets
3. **VerifyingPaymaster.sol** - Paymaster para sponsorear gas
4. **PasskeyValidator.sol** - Validador de Passkeys (WebAuthn) compatible con ERC-7212

### Deployment:

Los contratos están basados en la implementación oficial de eth-infinitism:
- https://github.com/eth-infinitism/account-abstraction

### Addresses (Para testing en testnets):

**EntryPoint v0.7.0** (Deployado en todas las chains EVM principales):
```
0x0000000071727De22E5E9d8BAf0edAc6f37da032
```

**Nuestros contratos** (Deploy con scripts):
- SimpleAccountFactory: TBD
- VerifyingPaymaster: TBD

### Testing Local:

```bash
# Usar Hardhat/Foundry para deploy local
# O usar direcciones existentes en testnets
```

### Networks Soportadas:

- Ethereum Mainnet & Sepolia
- Polygon & Mumbai
- Arbitrum & Arbitrum Sepolia
- Optimism & Optimism Sepolia
- Base & Base Sepolia
- Avalanche & Fuji
- BSC & BSC Testnet

**NOTA**: Para esta demo, usaremos contratos pre-deployados en Sepolia testnet.
