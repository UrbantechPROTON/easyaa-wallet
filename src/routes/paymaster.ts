import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS for all paymaster routes
app.use('/*', cors());

/**
 * Paymaster Service - Sponsors gas for users
 * 
 * This is a simplified paymaster that sponsors all transactions
 * In production, you would:
 * - Verify user authorization
 * - Check spending limits
 * - Implement rate limiting
 * - Track gas costs for billing
 */

interface PaymasterRequest {
  userOperation: any;
  entryPoint: string;
  chainId: number;
}

/**
 * POST /api/paymaster/sponsor
 * Returns paymaster signature to sponsor transaction gas
 */
app.post('/sponsor', async (c) => {
  try {
    const body: PaymasterRequest = await c.req.json();
    const { userOperation, entryPoint, chainId } = body;

    // Validate request
    if (!userOperation || !entryPoint || !chainId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // In production, use a real paymaster service:
    // - Pimlico: https://docs.pimlico.io/
    // - Stackup: https://docs.stackup.sh/
    // - Alchemy: https://docs.alchemy.com/
    
    // For demo, we'll use public paymaster endpoints
    const paymasterUrl = getPaymasterUrl(chainId);
    
    if (!paymasterUrl) {
      return c.json({ 
        error: 'Unsupported chain',
        message: 'Use your own paymaster for this chain'
      }, 400);
    }

    // Call real paymaster service
    const response = await fetch(paymasterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_sponsorUserOperation',
        params: [userOperation, entryPoint]
      })
    });

    const data = await response.json();

    if (data.error) {
      return c.json({ 
        error: 'Paymaster error',
        message: data.error.message 
      }, 500);
    }

    return c.json({
      paymasterAndData: data.result.paymasterAndData,
      preVerificationGas: data.result.preVerificationGas,
      verificationGasLimit: data.result.verificationGasLimit,
      callGasLimit: data.result.callGasLimit,
    });

  } catch (error: any) {
    console.error('Paymaster error:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /api/paymaster/config
 * Returns paymaster configuration
 */
app.get('/config', (c) => {
  return c.json({
    supported: true,
    networks: {
      sepolia: { 
        chainId: 11155111,
        enabled: true,
        paymasterType: 'verifying'
      },
      polygon: { 
        chainId: 137,
        enabled: true,
        paymasterType: 'verifying'
      },
      arbitrum: { 
        chainId: 42161,
        enabled: true,
        paymasterType: 'verifying'
      },
      base: { 
        chainId: 8453,
        enabled: true,
        paymasterType: 'verifying'
      }
    },
    limits: {
      maxGasPerTransaction: '1000000',
      dailyLimitPerUser: '10000000',
      monthlyLimitPerUser: '100000000'
    }
  });
});

/**
 * GET /api/paymaster/stats
 * Returns usage statistics (for demo)
 */
app.get('/stats', (c) => {
  return c.json({
    totalTransactions: 0,
    totalGasSponsored: '0',
    activeUsers: 0,
    lastUpdated: new Date().toISOString()
  });
});

// Helper function to get paymaster URL for chain
function getPaymasterUrl(chainId: number): string | null {
  // Public paymaster endpoints (some require API keys)
  const paymasters: Record<number, string> = {
    11155111: 'https://api.stackup.sh/v1/paymaster/ethereum-sepolia', // Sepolia
    // Add more as needed
  };

  return paymasters[chainId] || null;
}

export default app;
