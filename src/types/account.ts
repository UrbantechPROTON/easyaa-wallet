// Account Abstraction Types

export interface PasskeyCredential {
  id: string;
  publicKey: string;
  algorithm: string;
}

export interface UserAccount {
  email: string;
  passkey: PasskeyCredential;
  smartAccountAddress?: string;
  createdAt: number;
}

export interface SmartAccountConfig {
  entryPoint: `0x${string}`;
  factory: `0x${string}`;
  paymaster?: `0x${string}`;
  chainId: number;
}

export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

export interface BundlerResponse {
  userOpHash: string;
  status: 'pending' | 'included' | 'failed';
  transactionHash?: string;
}

export interface PaymasterRequest {
  userOperation: Partial<UserOperation>;
  entryPoint: string;
  chainId: number;
}

export interface PaymasterResponse {
  paymasterAndData: string;
  preVerificationGas: string;
  verificationGasLimit: string;
  callGasLimit: string;
}
