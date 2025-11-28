import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS
app.use('/*', cors());

/**
 * Account Management Routes
 * Handles user account creation and retrieval
 */

interface CreateAccountRequest {
  email: string;
  passkeyId: string;
  passkeyPublicKey: string;
  chainId: number;
}

interface AccountData {
  email: string;
  passkeyId: string;
  smartAccountAddress?: string;
  chainId: number;
  createdAt: string;
}

// In-memory storage for demo (use Cloudflare D1 in production)
const accounts = new Map<string, AccountData>();

/**
 * POST /api/account/create
 * Creates a new smart account for a user
 */
app.post('/create', async (c) => {
  try {
    const body: CreateAccountRequest = await c.req.json();
    const { email, passkeyId, passkeyPublicKey, chainId } = body;

    // Validate input
    if (!email || !passkeyId || !passkeyPublicKey || !chainId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if account already exists
    if (accounts.has(email)) {
      const existingAccount = accounts.get(email)!;
      return c.json({
        exists: true,
        account: existingAccount
      });
    }

    // In production, this would:
    // 1. Calculate counterfactual address using factory contract
    // 2. Store in database
    // 3. Return predicted address (wallet deploys on first transaction)

    // For demo, generate a deterministic address
    const smartAccountAddress = await calculateAccountAddress(
      email,
      passkeyPublicKey,
      chainId
    );

    const accountData: AccountData = {
      email,
      passkeyId,
      smartAccountAddress,
      chainId,
      createdAt: new Date().toISOString()
    };

    accounts.set(email, accountData);

    return c.json({
      success: true,
      account: accountData,
      message: 'Account created successfully. Wallet will be deployed on first transaction.'
    });

  } catch (error: any) {
    console.error('Account creation error:', error);
    return c.json({ 
      error: 'Failed to create account',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /api/account/list
 * Lists all accounts (demo only)
 */
app.get('/list', (c) => {
  const accountList = Array.from(accounts.values());
  return c.json({
    count: accountList.length,
    accounts: accountList
  });
});

/**
 * POST /api/account/verify-passkey
 * Verifies a passkey signature
 */
app.post('/verify-passkey', async (c) => {
  try {
    const { email, challenge, signature } = await c.req.json();

    const account = accounts.get(email);
    
    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }

    // In production, verify the signature using WebAuthn verification
    // For demo, we'll return success
    
    return c.json({
      valid: true,
      account: account.smartAccountAddress
    });

  } catch (error: any) {
    return c.json({ 
      error: 'Verification failed',
      message: error.message 
    }, 500);
  }
});

/**
 * GET /api/account/:email
 * Retrieves account information
 */
app.get('/:email', (c) => {
  const email = c.req.param('email');
  
  const account = accounts.get(email);
  
  if (!account) {
    return c.json({ error: 'Account not found' }, 404);
  }

  return c.json({ account });
});

/**
 * Calculate counterfactual smart account address
 * This uses CREATE2 to predict the address before deployment
 */
async function calculateAccountAddress(
  email: string,
  publicKey: string,
  chainId: number
): Promise<string> {
  // In production, use the factory contract's getAddress function
  // For demo, create a deterministic address
  
  const data = `${email}${publicKey}${chainId}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Take first 20 bytes (40 hex chars) and prepend 0x
  return '0x' + hashHex.slice(0, 40);
}

export default app;
