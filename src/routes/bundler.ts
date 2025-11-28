import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors());

/**
 * Bundler Proxy Routes
 * Proxies requests to public bundler services
 */

/**
 * POST /api/bundler/send-userop
 * Sends a UserOperation to the bundler
 */
app.post('/send-userop', async (c) => {
  try {
    const { userOperation, entryPoint, chainId } = await c.req.json();

    if (!userOperation || !entryPoint || !chainId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const bundlerUrl = getBundlerUrl(chainId);
    
    if (!bundlerUrl) {
      return c.json({ error: 'Unsupported chain' }, 400);
    }

    // Send to bundler
    const response = await fetch(bundlerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendUserOperation',
        params: [userOperation, entryPoint]
      })
    });

    const data = await response.json();

    if (data.error) {
      return c.json({ 
        error: 'Bundler error',
        message: data.error.message 
      }, 500);
    }

    return c.json({
      userOpHash: data.result,
      status: 'pending'
    });

  } catch (error: any) {
    console.error('Bundler error:', error);
    return c.json({ 
      error: 'Failed to send UserOperation',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /api/bundler/userop/:hash
 * Gets the receipt for a UserOperation
 */
app.get('/userop/:hash', async (c) => {
  try {
    const hash = c.req.param('hash');
    const chainId = parseInt(c.req.query('chainId') || '11155111');

    const bundlerUrl = getBundlerUrl(chainId);
    
    if (!bundlerUrl) {
      return c.json({ error: 'Unsupported chain' }, 400);
    }

    const response = await fetch(bundlerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getUserOperationReceipt',
        params: [hash]
      })
    });

    const data = await response.json();

    if (data.error) {
      return c.json({ 
        error: 'Bundler error',
        message: data.error.message 
      }, 500);
    }

    const receipt = data.result;

    if (!receipt) {
      return c.json({
        status: 'pending',
        message: 'UserOperation not yet included'
      });
    }

    return c.json({
      status: receipt.success ? 'success' : 'failed',
      transactionHash: receipt.receipt.transactionHash,
      blockNumber: receipt.receipt.blockNumber,
      gasUsed: receipt.actualGasUsed
    });

  } catch (error: any) {
    console.error('Receipt fetch error:', error);
    return c.json({ 
      error: 'Failed to fetch receipt',
      message: error.message 
    }, 500);
  }
});

/**
 * POST /api/bundler/estimate-gas
 * Estimates gas for a UserOperation
 */
app.post('/estimate-gas', async (c) => {
  try {
    const { userOperation, entryPoint, chainId } = await c.req.json();

    if (!userOperation || !entryPoint || !chainId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const bundlerUrl = getBundlerUrl(chainId);
    
    if (!bundlerUrl) {
      return c.json({ error: 'Unsupported chain' }, 400);
    }

    const response = await fetch(bundlerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_estimateUserOperationGas',
        params: [userOperation, entryPoint]
      })
    });

    const data = await response.json();

    if (data.error) {
      return c.json({ 
        error: 'Estimation error',
        message: data.error.message 
      }, 500);
    }

    return c.json(data.result);

  } catch (error: any) {
    console.error('Gas estimation error:', error);
    return c.json({ 
      error: 'Failed to estimate gas',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /api/bundler/supported-chains
 * Returns list of supported chains
 */
app.get('/supported-chains', (c) => {
  return c.json({
    chains: [
      { chainId: 11155111, name: 'Sepolia', enabled: true },
      { chainId: 137, name: 'Polygon', enabled: true },
      { chainId: 42161, name: 'Arbitrum', enabled: true },
      { chainId: 8453, name: 'Base', enabled: true },
      { chainId: 84532, name: 'Base Sepolia', enabled: true }
    ]
  });
});

// Helper function to get bundler URL
function getBundlerUrl(chainId: number): string | null {
  const bundlers: Record<number, string> = {
    11155111: 'https://api.stackup.sh/v1/node/ethereum-sepolia',
    137: 'https://api.stackup.sh/v1/node/polygon',
    42161: 'https://api.stackup.sh/v1/node/arbitrum',
    8453: 'https://api.stackup.sh/v1/node/base',
    84532: 'https://sepolia.base.org'
  };

  return bundlers[chainId] || null;
}

export default app;
