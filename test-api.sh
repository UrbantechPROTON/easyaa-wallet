#!/bin/bash

echo "🧪 Testing EasyAA Wallet API"
echo "=============================="
echo ""

BASE_URL="http://localhost:3000"

echo "1️⃣ Health Check..."
curl -s $BASE_URL/api/health | jq .
echo ""

echo "2️⃣ Paymaster Config..."
curl -s $BASE_URL/api/paymaster/config | jq .
echo ""

echo "3️⃣ Paymaster Stats..."
curl -s $BASE_URL/api/paymaster/stats | jq .
echo ""

echo "4️⃣ Bundler Supported Chains..."
curl -s $BASE_URL/api/bundler/supported-chains | jq .
echo ""

echo "5️⃣ Create Account..."
curl -s -X POST $BASE_URL/api/account/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "passkeyId": "demo_passkey_123",
    "passkeyPublicKey": "pk_demo_key",
    "chainId": 11155111
  }' | jq .
echo ""

echo "6️⃣ Get Account..."
curl -s $BASE_URL/api/account/demo@example.com | jq .
echo ""

echo "7️⃣ List Accounts..."
curl -s $BASE_URL/api/account/list | jq .
echo ""

echo "✅ All tests completed!"
