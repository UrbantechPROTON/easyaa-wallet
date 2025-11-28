/**
 * EasyAA SDK - Account Abstraction SDK for dApps
 * 
 * This SDK allows any dApp to integrate EasyAA Wallet functionality
 * 
 * Usage:
 * ```typescript
 * import { EasyAASDK } from './sdk';
 * 
 * const sdk = new EasyAASDK({
 *   apiUrl: 'https://your-api.com',
 *   chainId: 11155111,
 *   paymasterEnabled: true
 * });
 * 
 * // Create account
 * const account = await sdk.createAccount('user@example.com');
 * 
 * // Send transaction
 * const tx = await sdk.sendTransaction({
 *   to: '0x...',
 *   value: '0.01',
 *   data: '0x'
 * });
 * ```
 */

export interface EasyAAConfig {
  apiUrl: string;
  chainId: number;
  entryPoint?: string;
  paymasterEnabled?: boolean;
}

export interface AccountInfo {
  email: string;
  address: string;
  passkeyId: string;
}

export interface TransactionRequest {
  to: string;
  value?: string;
  data?: string;
}

export interface TransactionResponse {
  userOpHash: string;
  status: 'pending' | 'success' | 'failed';
  transactionHash?: string;
}

export class EasyAASDK {
  private config: EasyAAConfig;
  private account: AccountInfo | null = null;

  constructor(config: EasyAAConfig) {
    this.config = {
      entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
      paymasterEnabled: true,
      ...config
    };
  }

  /**
   * Create a new smart account with passkey
   */
  async createAccount(email: string): Promise<AccountInfo> {
    // Check WebAuthn support
    if (!this.isWebAuthnSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    // Create passkey
    const credential = await this.createPasskey(email);

    // Register with backend
    const response = await fetch(`${this.config.apiUrl}/api/account/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        passkeyId: this.arrayBufferToBase64(credential.rawId),
        passkeyPublicKey: this.extractPublicKey(credential),
        chainId: this.config.chainId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create account');
    }

    const data = await response.json();

    this.account = {
      email,
      address: data.account.smartAccountAddress,
      passkeyId: this.arrayBufferToBase64(credential.rawId)
    };

    return this.account;
  }

  /**
   * Get current account info
   */
  getAccount(): AccountInfo | null {
    return this.account;
  }

  /**
   * Send a gasless transaction
   */
  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    if (!this.account) {
      throw new Error('No account connected. Call createAccount first.');
    }

    // Build UserOperation
    const userOp = await this.buildUserOperation(tx);

    // Get paymaster data if enabled
    if (this.config.paymasterEnabled) {
      const paymasterData = await this.getPaymasterData(userOp);
      userOp.paymasterAndData = paymasterData.paymasterAndData;
    }

    // Sign with passkey
    const signature = await this.signUserOperation(userOp);
    userOp.signature = signature;

    // Send to bundler
    const response = await fetch(`${this.config.apiUrl}/api/bundler/send-userop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userOperation: userOp,
        entryPoint: this.config.entryPoint,
        chainId: this.config.chainId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Transaction failed');
    }

    const data = await response.json();

    return {
      userOpHash: data.userOpHash,
      status: 'pending'
    };
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(userOpHash: string): Promise<TransactionResponse> {
    const response = await fetch(
      `${this.config.apiUrl}/api/bundler/userop/${userOpHash}?chainId=${this.config.chainId}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch receipt');
    }

    return await response.json();
  }

  /**
   * Sign a message with passkey
   */
  async signMessage(message: string): Promise<string> {
    if (!this.account) {
      throw new Error('No account connected');
    }

    const challenge = new TextEncoder().encode(message);
    const assertion = await this.signWithPasskey(this.account.passkeyId, challenge);

    return this.formatPasskeySignature(assertion);
  }

  /**
   * Check if WebAuthn is supported
   */
  isWebAuthnSupported(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.PublicKeyCredential !== 'undefined';
  }

  // Private helper methods

  private async createPasskey(username: string): Promise<any> {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'EasyAA Wallet',
        id: window.location.hostname
      },
      user: {
        id: new TextEncoder().encode(username),
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: false,
        userVerification: 'required'
      },
      timeout: 60000,
      attestation: 'none'
    };

    return await navigator.credentials.create({ publicKey: publicKeyOptions });
  }

  private async signWithPasskey(credentialId: string, challenge: Uint8Array): Promise<any> {
    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [
        {
          id: this.base64ToArrayBuffer(credentialId),
          type: 'public-key'
        }
      ],
      timeout: 60000,
      userVerification: 'required'
    };

    return await navigator.credentials.get({ publicKey: publicKeyOptions });
  }

  private async buildUserOperation(tx: TransactionRequest): Promise<any> {
    // Simplified UserOperation builder
    // In production, use proper ERC-4337 libraries
    return {
      sender: this.account!.address,
      nonce: '0x0',
      initCode: '0x',
      callData: this.encodeCallData(tx),
      callGasLimit: '100000',
      verificationGasLimit: '500000',
      preVerificationGas: '50000',
      maxFeePerGas: '1000000000',
      maxPriorityFeePerGas: '1000000000',
      paymasterAndData: '0x',
      signature: '0x'
    };
  }

  private encodeCallData(tx: TransactionRequest): string {
    // Simplified - encode execute(to, value, data)
    // In production, use proper ABI encoding
    return '0x';
  }

  private async getPaymasterData(userOp: any): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}/api/paymaster/sponsor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userOperation: userOp,
        entryPoint: this.config.entryPoint,
        chainId: this.config.chainId
      })
    });

    if (!response.ok) {
      throw new Error('Paymaster sponsorship failed');
    }

    return await response.json();
  }

  private async signUserOperation(userOp: any): Promise<string> {
    // Create hash to sign
    const message = JSON.stringify(userOp);
    const challenge = new TextEncoder().encode(message);

    // Sign with passkey
    const assertion = await this.signWithPasskey(this.account!.passkeyId, challenge);

    return this.formatPasskeySignature(assertion);
  }

  private extractPublicKey(credential: any): string {
    return this.arrayBufferToBase64(credential.rawId);
  }

  private formatPasskeySignature(assertion: any): string {
    // Pack signature for smart contract
    const authenticatorData = new Uint8Array(assertion.response.authenticatorData);
    const signature = new Uint8Array(assertion.response.signature);

    const packed = new Uint8Array(authenticatorData.length + signature.length);
    packed.set(authenticatorData, 0);
    packed.set(signature, authenticatorData.length);

    return '0x' + Array.from(packed).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Export for browser
if (typeof window !== 'undefined') {
  (window as any).EasyAASDK = EasyAASDK;
}
