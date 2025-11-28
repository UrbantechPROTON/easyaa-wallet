// EasyAA Wallet - Frontend Application
// Account Abstraction with Passkeys (WebAuthn)

class EasyAAWallet {
  constructor() {
    this.account = null;
    this.chainId = 11155111; // Sepolia testnet
    this.entryPoint = '0x0000000071727De22E5E9d8BAf0edAc6f37da032';
    this.init();
  }

  init() {
    this.renderUI();
    this.loadAccount();
    this.attachEventListeners();
  }

  renderUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <!-- Header -->
      <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center">
              <i class="fas fa-wallet text-primary text-2xl mr-3"></i>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EasyAA Wallet
              </h1>
            </div>
            <div class="text-sm text-gray-600">
              <span class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                <i class="fas fa-link mr-1"></i>
                Sepolia Testnet
              </span>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Hero Section -->
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            Web3 Wallet Without the Complexity
          </h2>
          <p class="text-xl text-gray-600 mb-8">
            No MetaMask. No seed phrases. No gas fees. Just your fingerprint.
          </p>
        </div>

        <!-- Features -->
        <div class="grid md:grid-cols-3 gap-6 mb-12">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-fingerprint text-primary text-2xl"></i>
            </div>
            <h3 class="text-lg font-semibold mb-2">Biometric Security</h3>
            <p class="text-gray-600">Sign transactions with FaceID or fingerprint using WebAuthn passkeys</p>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-gas-pump text-secondary text-2xl"></i>
            </div>
            <h3 class="text-lg font-semibold mb-2">Gasless Transactions</h3>
            <p class="text-gray-600">We sponsor your gas fees via ERC-4337 Account Abstraction</p>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-shield-alt text-pink-600 text-2xl"></i>
            </div>
            <h3 class="text-lg font-semibold mb-2">Smart Contract Wallet</h3>
            <p class="text-gray-600">Your funds secured by audited smart contracts, not browser extensions</p>
          </div>
        </div>

        <!-- Wallet Section -->
        <div id="wallet-section" class="max-w-2xl mx-auto">
          <!-- Login/Create Account -->
          <div id="auth-section" class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h3 class="text-2xl font-bold mb-6 text-center">Get Started</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  id="email-input" 
                  placeholder="you@example.com"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <button 
                id="create-account-btn"
                class="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition">
                <i class="fas fa-fingerprint mr-2"></i>
                Create Wallet with Passkey
              </button>

              <div class="text-center text-sm text-gray-500">
                <i class="fas fa-lock mr-1"></i>
                Your passkey never leaves your device
              </div>
            </div>
          </div>

          <!-- Account Dashboard (hidden initially) -->
          <div id="dashboard-section" class="hidden">
            <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 mb-6">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <h3 class="text-xl font-bold mb-2">Your Smart Account</h3>
                  <p class="text-sm text-gray-600" id="account-email"></p>
                </div>
                <button id="logout-btn" class="text-gray-400 hover:text-gray-600">
                  <i class="fas fa-sign-out-alt"></i>
                </button>
              </div>

              <div class="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white mb-6">
                <p class="text-sm opacity-90 mb-2">Wallet Address</p>
                <p class="font-mono text-sm break-all" id="account-address"></p>
                <button id="copy-address-btn" class="mt-3 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                  <i class="fas fa-copy mr-2"></i>Copy Address
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600 mb-1">Balance</p>
                  <p class="text-2xl font-bold">0.00 ETH</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600 mb-1">Transactions</p>
                  <p class="text-2xl font-bold">0</p>
                </div>
              </div>

              <div class="space-y-3">
                <button id="send-tx-btn" class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 transition">
                  <i class="fas fa-paper-plane mr-2"></i>
                  Send Transaction (Demo)
                </button>
                <button id="sign-message-btn" class="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
                  <i class="fas fa-signature mr-2"></i>
                  Sign Message
                </button>
              </div>
            </div>

            <!-- Transaction Log -->
            <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <h3 class="text-xl font-bold mb-4">Recent Activity</h3>
              <div id="tx-log" class="space-y-3 text-sm text-gray-500">
                <p class="text-center py-8">No transactions yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="mt-12 text-center">
          <div class="inline-flex items-center space-x-8 text-sm text-gray-600">
            <div>
              <i class="fas fa-check-circle text-green-500 mr-2"></i>
              <strong>100% Open Source</strong>
            </div>
            <div>
              <i class="fas fa-dollar-sign text-green-500 mr-2"></i>
              <strong>$0 Monthly Fee</strong>
            </div>
            <div>
              <i class="fas fa-code text-blue-500 mr-2"></i>
              <strong>Easy Integration</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div id="loading-overlay" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-sm mx-4">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
            <p class="text-lg font-semibold" id="loading-text">Processing...</p>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div id="toast" class="hidden fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm border-l-4 z-50">
        <p id="toast-message"></p>
      </div>
    `;
  }

  attachEventListeners() {
    document.getElementById('create-account-btn').addEventListener('click', () => this.createAccount());
    document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    document.getElementById('copy-address-btn')?.addEventListener('click', () => this.copyAddress());
    document.getElementById('send-tx-btn')?.addEventListener('click', () => this.sendDemoTransaction());
    document.getElementById('sign-message-btn')?.addEventListener('click', () => this.signMessage());
  }

  async createAccount() {
    const email = document.getElementById('email-input').value.trim();
    
    if (!email || !email.includes('@')) {
      this.showToast('Please enter a valid email', 'error');
      return;
    }

    this.showLoading('Creating your passkey...');

    try {
      // Check WebAuthn support
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn not supported in this browser');
      }

      // Create passkey
      const credential = await this.createPasskey(email);
      
      this.showLoading('Setting up your smart account...');

      // Register with backend
      const response = await fetch('/api/account/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          passkeyId: this.arrayBufferToBase64(credential.rawId),
          passkeyPublicKey: this.extractPublicKey(credential),
          chainId: this.chainId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      this.account = {
        email,
        address: data.account.smartAccountAddress,
        passkeyId: this.arrayBufferToBase64(credential.rawId)
      };

      this.saveAccount();
      this.showDashboard();
      this.showToast('Wallet created successfully!', 'success');

    } catch (error) {
      console.error('Account creation error:', error);
      this.showToast(error.message, 'error');
    } finally {
      this.hideLoading();
    }
  }

  async createPasskey(username) {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyOptions = {
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
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' } // RS256
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

  extractPublicKey(credential) {
    // Simplified - in production, properly decode COSE key
    return this.arrayBufferToBase64(credential.rawId);
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  saveAccount() {
    localStorage.setItem('easyaa_account', JSON.stringify(this.account));
  }

  loadAccount() {
    const saved = localStorage.getItem('easyaa_account');
    if (saved) {
      this.account = JSON.parse(saved);
      this.showDashboard();
    }
  }

  showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('account-email').textContent = this.account.email;
    document.getElementById('account-address').textContent = this.account.address;
  }

  logout() {
    this.account = null;
    localStorage.removeItem('easyaa_account');
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('email-input').value = '';
  }

  copyAddress() {
    navigator.clipboard.writeText(this.account.address);
    this.showToast('Address copied!', 'success');
  }

  async sendDemoTransaction() {
    this.showToast('Demo: Transaction sent! (Simulated)', 'success');
    this.logTransaction('Demo Transfer', '0.01 ETH', 'pending');
  }

  async signMessage() {
    this.showToast('Demo: Message signed! (Simulated)', 'success');
  }

  logTransaction(type, amount, status) {
    const log = document.getElementById('tx-log');
    const statusColors = {
      pending: 'text-yellow-600',
      success: 'text-green-600',
      failed: 'text-red-600'
    };

    log.innerHTML = \`
      <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <div>
          <p class="font-semibold">\${type}</p>
          <p class="text-xs text-gray-500">\${new Date().toLocaleString()}</p>
        </div>
        <div class="text-right">
          <p class="font-semibold">\${amount}</p>
          <p class="text-xs \${statusColors[status]}">\${status}</p>
        </div>
      </div>
    \` + log.innerHTML;
  }

  showLoading(text) {
    document.getElementById('loading-text').textContent = text;
    document.getElementById('loading-overlay').classList.remove('hidden');
  }

  hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    const colors = {
      success: 'border-green-500 text-green-800',
      error: 'border-red-500 text-red-800',
      info: 'border-blue-500 text-blue-800'
    };

    toast.className = \`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm border-l-4 z-50 \${colors[type]}\`;
    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new EasyAAWallet();
});
