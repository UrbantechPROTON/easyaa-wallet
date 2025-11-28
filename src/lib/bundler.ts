// Bundler client for Account Abstraction
// Uses public bundlers (Stackup, Pimlico, Alchemy)

export interface BundlerConfig {
  rpcUrl: string;
  apiKey?: string;
}

export class BundlerClient {
  private rpcUrl: string;

  constructor(config: BundlerConfig) {
    this.rpcUrl = config.rpcUrl;
  }

  async sendUserOperation(userOp: any, entryPoint: string): Promise<string> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendUserOperation',
        params: [userOp, entryPoint]
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`Bundler error: ${data.error.message}`);
    }

    return data.result;
  }

  async getUserOperationReceipt(userOpHash: string): Promise<any> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getUserOperationReceipt',
        params: [userOpHash]
      })
    });

    const data = await response.json();
    return data.result;
  }

  async estimateUserOperationGas(userOp: any, entryPoint: string): Promise<any> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_estimateUserOperationGas',
        params: [userOp, entryPoint]
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`Gas estimation error: ${data.error.message}`);
    }

    return data.result;
  }
}

// Public bundler endpoints (free tiers)
export const BUNDLER_URLS = {
  sepolia: {
    stackup: 'https://api.stackup.sh/v1/node/ethereum-sepolia',
    pimlico: 'https://api.pimlico.io/v2/sepolia/rpc',
    alchemy: 'https://eth-sepolia.g.alchemy.com/v2/demo'
  },
  polygon: {
    stackup: 'https://api.stackup.sh/v1/node/polygon',
    pimlico: 'https://api.pimlico.io/v2/polygon/rpc'
  },
  arbitrum: {
    stackup: 'https://api.stackup.sh/v1/node/arbitrum',
    pimlico: 'https://api.pimlico.io/v2/arbitrum/rpc'
  },
  base: {
    stackup: 'https://api.stackup.sh/v1/node/base',
    pimlico: 'https://api.pimlico.io/v2/base/rpc'
  }
};
