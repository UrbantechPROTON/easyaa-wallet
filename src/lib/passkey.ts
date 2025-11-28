// WebAuthn / Passkey utilities for Account Abstraction

export interface PasskeyCredential {
  id: string;
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject: ArrayBuffer;
  };
  type: 'public-key';
}

export interface PasskeyAssertion {
  id: string;
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    authenticatorData: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle: ArrayBuffer | null;
  };
  type: 'public-key';
}

/**
 * Create a new Passkey credential using WebAuthn
 */
export async function createPasskey(username: string): Promise<PasskeyCredential> {
  // Check if WebAuthn is supported
  if (!window.PublicKeyCredential) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'EasyAA Wallet',
      id: window.location.hostname,
    },
    user: {
      id: new TextEncoder().encode(username),
      name: username,
      displayName: username,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },  // ES256
      { alg: -257, type: 'public-key' }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      requireResidentKey: false,
      userVerification: 'required',
    },
    timeout: 60000,
    attestation: 'none',
  };

  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  }) as any;

  return credential;
}

/**
 * Sign a challenge using an existing Passkey
 */
export async function signWithPasskey(
  credentialId: string,
  challenge: Uint8Array
): Promise<PasskeyAssertion> {
  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    allowCredentials: [
      {
        id: base64ToArrayBuffer(credentialId),
        type: 'public-key',
      },
    ],
    timeout: 60000,
    userVerification: 'required',
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  }) as any;

  return assertion;
}

/**
 * Extract public key from attestation response
 */
export function extractPublicKey(credential: PasskeyCredential): string {
  // Parse CBOR attestation object to extract public key
  // This is a simplified version - in production, use a proper CBOR library
  const attestationObject = credential.response.attestationObject;
  
  // For demo purposes, we'll return the credential ID as a placeholder
  // In production, properly decode the COSE key from attestationObject
  return arrayBufferToBase64(credential.rawId);
}

/**
 * Convert ArrayBuffer to Base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Format signature for ERC-4337 validation
 */
export function formatPasskeySignature(assertion: PasskeyAssertion): string {
  const authenticatorData = new Uint8Array(assertion.response.authenticatorData);
  const clientDataJSON = new Uint8Array(assertion.response.clientDataJSON);
  const signature = new Uint8Array(assertion.response.signature);

  // Pack signature data for smart contract verification
  // Format: authenticatorData || clientDataJSON || signature
  const packed = new Uint8Array(
    authenticatorData.length + clientDataJSON.length + signature.length + 12
  );

  let offset = 0;
  
  // Write lengths
  const view = new DataView(packed.buffer);
  view.setUint32(offset, authenticatorData.length, false);
  offset += 4;
  view.setUint32(offset, clientDataJSON.length, false);
  offset += 4;
  view.setUint32(offset, signature.length, false);
  offset += 4;

  // Write data
  packed.set(authenticatorData, offset);
  offset += authenticatorData.length;
  packed.set(clientDataJSON, offset);
  offset += clientDataJSON.length;
  packed.set(signature, offset);

  return '0x' + Array.from(packed).map(b => b.toString(16).padStart(2, '0')).join('');
}
