# EasyAA SDK - Integration Guide

## Quick Start

Integrate EasyAA Wallet into your dApp in **3 simple steps**:

### 1. Install the SDK

```bash
npm install easyaa-wallet-sdk
# or use CDN
<script src="https://your-domain.com/sdk.js"></script>
```

### 2. Initialize

```javascript
import { EasyAASDK } from 'easyaa-wallet-sdk';

const wallet = new EasyAASDK({
  apiUrl: 'https://your-easyaa-api.com',
  chainId: 11155111, // Sepolia testnet
  paymasterEnabled: true // Enable gasless transactions
});
```

### 3. Use in Your dApp

```javascript
// Create account with passkey
const account = await wallet.createAccount('user@example.com');
console.log('Smart Account:', account.address);

// Send gasless transaction
const tx = await wallet.sendTransaction({
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  value: '0.01', // ETH
  data: '0x' // Optional contract call data
});

console.log('Transaction:', tx.userOpHash);

// Check transaction status
const receipt = await wallet.getTransactionReceipt(tx.userOpHash);
console.log('Status:', receipt.status);
```

## Full Example: NFT Minting dApp

```html
<!DOCTYPE html>
<html>
<head>
  <title>My NFT Minting dApp</title>
  <script src="https://your-domain.com/sdk.js"></script>
</head>
<body>
  <button id="connect">Connect with EasyAA</button>
  <button id="mint" disabled>Mint NFT (Gasless)</button>

  <script>
    const wallet = new EasyAASDK({
      apiUrl: 'https://your-easyaa-api.com',
      chainId: 11155111,
      paymasterEnabled: true
    });

    let account = null;

    document.getElementById('connect').onclick = async () => {
      const email = prompt('Enter your email:');
      account = await wallet.createAccount(email);
      
      alert(`Connected! Your wallet: ${account.address}`);
      document.getElementById('mint').disabled = false;
    };

    document.getElementById('mint').onclick = async () => {
      const tx = await wallet.sendTransaction({
        to: '0xYourNFTContract',
        data: encodeMintFunction() // Your contract ABI encoding
      });

      alert(`Minting... Transaction: ${tx.userOpHash}`);
      
      // Wait for confirmation
      while (true) {
        const receipt = await wallet.getTransactionReceipt(tx.userOpHash);
        if (receipt.status === 'success') {
          alert('NFT Minted! 🎉');
          break;
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    };
  </script>
</body>
</html>
```

## React Integration

```typescript
import { EasyAASDK } from 'easyaa-wallet-sdk';
import { useState, useEffect } from 'react';

function MyDApp() {
  const [wallet, setWallet] = useState<EasyAASDK | null>(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const sdk = new EasyAASDK({
      apiUrl: process.env.REACT_APP_EASYAA_API,
      chainId: 11155111,
      paymasterEnabled: true
    });
    setWallet(sdk);
  }, []);

  const connect = async () => {
    const email = prompt('Enter email:');
    const acc = await wallet!.createAccount(email);
    setAccount(acc);
  };

  const sendTx = async () => {
    const tx = await wallet!.sendTransaction({
      to: '0x...',
      value: '0.01'
    });
    console.log('Sent:', tx.userOpHash);
  };

  return (
    <div>
      {!account ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {account.address}</p>
          <button onClick={sendTx}>Send Transaction</button>
        </>
      )}
    </div>
  );
}
```

## API Reference

### Constructor

```typescript
new EasyAASDK(config: {
  apiUrl: string;        // Your EasyAA API endpoint
  chainId: number;       // Chain ID (11155111 = Sepolia)
  entryPoint?: string;   // Optional: Custom EntryPoint
  paymasterEnabled?: boolean; // Default: true
})
```

### Methods

#### `createAccount(email: string): Promise<AccountInfo>`
Creates a smart account using passkey authentication.

**Returns:**
```typescript
{
  email: string;
  address: string;      // Smart account address
  passkeyId: string;    // Passkey credential ID
}
```

#### `getAccount(): AccountInfo | null`
Returns current connected account or null.

#### `sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>`
Sends a gasless transaction (if paymaster enabled).

**Parameters:**
```typescript
{
  to: string;          // Recipient address
  value?: string;      // ETH amount (optional)
  data?: string;       // Contract call data (optional)
}
```

**Returns:**
```typescript
{
  userOpHash: string;  // UserOperation hash
  status: 'pending' | 'success' | 'failed';
  transactionHash?: string;
}
```

#### `getTransactionReceipt(userOpHash: string): Promise<TransactionResponse>`
Gets transaction receipt by UserOperation hash.

#### `signMessage(message: string): Promise<string>`
Signs a message using passkey.

#### `isWebAuthnSupported(): boolean`
Checks if browser supports WebAuthn/Passkeys.

## Configuration Options

### Networks Supported

| Network | Chain ID | EntryPoint |
|---------|----------|------------|
| Ethereum Sepolia | 11155111 | 0x0000000071727De22E5E9d8BAf0edAc6f37da032 |
| Polygon | 137 | 0x0000000071727De22E5E9d8BAf0edAc6f37da032 |
| Arbitrum | 42161 | 0x0000000071727De22E5E9d8BAf0edAc6f37da032 |
| Base | 8453 | 0x0000000071727De22E5E9d8BAf0edAc6f37da032 |

### Gas Sponsorship

Control who pays for gas:

```javascript
// Option 1: Full sponsorship (your API pays)
const wallet = new EasyAASDK({
  apiUrl: 'https://api.example.com',
  paymasterEnabled: true
});

// Option 2: User pays (traditional)
const wallet = new EasyAASDK({
  apiUrl: 'https://api.example.com',
  paymasterEnabled: false
});

// Option 3: Conditional (sponsor small txs, user pays large)
// Implement in your paymaster API logic
```

## Security Best Practices

1. **Never expose private keys** - Passkeys stay on user's device
2. **Validate user emails** - Implement email verification
3. **Rate limit API calls** - Prevent abuse
4. **Monitor gas costs** - Set spending limits per user
5. **Use HTTPS only** - WebAuthn requires secure context

## Troubleshooting

### "WebAuthn not supported"
- User's browser doesn't support passkeys
- Not using HTTPS (required for WebAuthn)
- Solution: Use email magic link as fallback

### "Paymaster error"
- Insufficient funds in paymaster
- Transaction gas limit exceeded
- Solution: Check paymaster balance and limits

### "Transaction failed"
- Invalid contract call
- Insufficient balance (if paymaster disabled)
- Solution: Check transaction data and logs

## Cost Comparison

| Solution | Monthly Cost | Gas Costs | Lock-in |
|----------|--------------|-----------|---------|
| Human Wallet | $XXX/MAT | Included | Yes |
| **EasyAA (Ours)** | **$0-5** | **You control** | **No** |
| Alchemy AA | Free tier | Pay per tx | Partial |
| Magic.link | $50+/mo | Separate | Yes |

## Support

- 📚 Docs: https://github.com/your-repo/docs
- 💬 Discord: https://discord.gg/easyaa
- 🐛 Issues: https://github.com/your-repo/issues

## License

MIT License - 100% Open Source
