# ShadowTrade

**Privacy-Preserving Arbitrage Strategy Platform powered by Fully Homomorphic Encryption**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-shadowtrade.vercel.app-blue)](https://shadowtrade.vercel.app)
[![Network](https://img.shields.io/badge/Network-Sepolia%20Testnet-orange)](https://sepolia.etherscan.io)
[![FHE SDK](https://img.shields.io/badge/Zama%20fhEVM-v0.9.1-green)](https://docs.zama.ai/fhevm)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## Overview

ShadowTrade is a revolutionary decentralized platform that enables traders to create, manage, and share encrypted arbitrage strategies on-chain. By leveraging Zama's Fully Homomorphic Encryption (FHE) technology, ShadowTrade ensures complete confidentiality of trading parameters while maintaining full on-chain verifiability and execution capability.

### The Problem We Solve

Traditional algorithmic trading faces a critical dilemma:
- **On-chain transparency** exposes proprietary strategies to front-running and copy-trading
- **Off-chain execution** sacrifices trustlessness and verifiability
- **Centralized platforms** require trusting third parties with sensitive trading logic

ShadowTrade resolves this trilemma by executing encrypted computations directly on-chain, ensuring strategies remain private while being fully verifiable and decentralized.

## Key Features

### Encrypted Strategy Management
- **FHE-Protected Parameters**: Capital, exposure limits, target returns, stop-loss thresholds, and slippage tolerances are encrypted using Zama's fhEVM
- **On-Chain Privacy**: All sensitive data stored as encrypted ciphertexts (euint64, euint32, euint16, euint8)
- **Zero-Knowledge Execution**: Strategy logic executes on encrypted data without decryption

### Strategy Sharing with FHE Access Control
- **Granular Sharing**: Share strategies with specific wallet addresses using `FHE.allow()`
- **Read-Only Access**: Recipients can view encrypted parameters but cannot modify
- **Revocable Permissions**: Strategy owners can revoke access at any time
- **Privacy-Preserving Collaboration**: Share insights without exposing actual values

### Multi-Strategy Portfolio
- **Four Arbitrage Types**: Spatial, Temporal, Statistical, and Triangular arbitrage strategies
- **Risk Tiers**: Conservative, Moderate, and Aggressive risk profiles
- **Lifecycle Management**: Draft → Active → Paused → Completed status transitions
- **Performance Tracking**: Encrypted execution counts and success rates

## Technical Architecture

### Smart Contract: CovertArbitrageDeck.sol

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CovertArbitrageDeck Contract                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Storage Layer                                                           │
│  ├─ strategies: mapping(bytes32 => Strategy)                            │
│  ├─ traderStrategies: mapping(address => bytes32[])                     │
│  ├─ strategySharedWith: mapping(bytes32 => address[])                   │
│  ├─ sharedWithMe: mapping(address => bytes32[])                         │
│  └─ isSharedWith: mapping(bytes32 => mapping(address => bool))          │
├─────────────────────────────────────────────────────────────────────────┤
│  Encrypted Fields (per Strategy)                                         │
│  ├─ capitalCipher: euint64        (Initial capital allocation)          │
│  ├─ exposureCipher: euint64       (Maximum market exposure)             │
│  ├─ realizedPnLCipher: euint64    (Accumulated profit/loss)             │
│  ├─ targetReturnBpsCipher: euint32 (Target return in basis points)      │
│  ├─ stopLossBpsCipher: euint32    (Stop loss threshold in bps)          │
│  ├─ maxSlippageBpsCipher: euint16 (Max acceptable slippage)             │
│  ├─ venueCountCipher: euint8      (Number of trading venues)            │
│  └─ confidenceCipher: euint8      (Strategy confidence score)           │
├─────────────────────────────────────────────────────────────────────────┤
│  Core Functions                                                          │
│  ├─ createStrategy()      - Create encrypted strategy with FHE inputs   │
│  ├─ activateStrategy()    - Validate & activate (FHE policy checks)     │
│  ├─ pauseStrategy()       - Temporarily halt execution                  │
│  ├─ resumeStrategy()      - Resume paused strategy                      │
│  ├─ completeStrategy()    - Mark as completed                           │
│  ├─ recordExecution()     - Log trade with encrypted amounts            │
│  └─ requestPerformanceReview() - Async decryption for performance       │
├─────────────────────────────────────────────────────────────────────────┤
│  Sharing Functions                                                       │
│  ├─ shareStrategy(strategyId, recipient)   - Grant FHE read access      │
│  ├─ revokeShare(strategyId, user)          - Remove access              │
│  ├─ getStrategiesSharedWithMe()            - List received shares       │
│  ├─ getStrategySharedUsers(strategyId)     - List share recipients      │
│  └─ getSharedStrategyInfo(strategyId)      - Read shared strategy data  │
└─────────────────────────────────────────────────────────────────────────┘
```

### FHE Integration Flow

```
User Input → FHE Encryption → On-Chain Storage → FHE Computation → Async Decryption
     │              │                │                  │                │
     ▼              ▼                ▼                  ▼                ▼
┌─────────┐  ┌───────────┐   ┌─────────────┐   ┌─────────────┐   ┌──────────┐
│ Plain   │  │ Relayer   │   │  fhEVM      │   │ Encrypted   │   │ Gateway  │
│ Values  │→ │ SDK       │ → │  Contract   │ → │ Operations  │ → │ Decrypt  │
│         │  │ encrypt() │   │  Storage    │   │ FHE.add()   │   │ Callback │
└─────────┘  └───────────┘   └─────────────┘   │ FHE.ge()    │   └──────────┘
                                               │ FHE.le()    │
                                               │ FHE.and()   │
                                               └─────────────┘
```

### Strategy Sharing Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Strategy Sharing Flow                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Owner                        Contract                     Recipient    │
│     │                             │                              │       │
│     │  shareStrategy(id, addr)   │                              │       │
│     │ ─────────────────────────► │                              │       │
│     │                             │                              │       │
│     │                     ┌───────┴───────┐                     │       │
│     │                     │ FHE.allow()   │                     │       │
│     │                     │ for each      │                     │       │
│     │                     │ encrypted     │                     │       │
│     │                     │ field         │                     │       │
│     │                     └───────┬───────┘                     │       │
│     │                             │                              │       │
│     │                             │   getSharedStrategyInfo()   │       │
│     │                             │ ◄─────────────────────────── │       │
│     │                             │                              │       │
│     │                             │   Strategy data (read-only)  │       │
│     │                             │ ─────────────────────────── ►│       │
│     │                             │                              │       │
│     │  revokeShare(id, addr)     │                              │       │
│     │ ─────────────────────────► │                              │       │
│     │                             │   Access revoked             │       │
│     │                             │ ─────────────────────────── ►│       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Smart Contracts** | Solidity 0.8.24 + fhEVM | On-chain encrypted strategy logic |
| **FHE Runtime** | Zama fhEVM v0.9.1 | Homomorphic encryption operations |
| **FHE SDK** | Relayer SDK 0.3.0-5 | Client-side encryption & key management |
| **Frontend** | React 18 + TypeScript + Vite | Modern SPA with type safety |
| **Styling** | Tailwind CSS + shadcn/ui | Dark-mode optimized UI components |
| **Wallet** | RainbowKit + wagmi v2 | Multi-wallet connection |
| **Network** | Ethereum Sepolia | Testnet deployment |

## Deployment Information

| Resource | Address/URL |
|----------|-------------|
| **Live Application** | https://shadowtrade.vercel.app |
| **Contract Address** | `0xF3965f511c3b048fBE572d98abCf044837Adbc7B` |
| **Network** | Sepolia Testnet (Chain ID: 11155111) |
| **Block Explorer** | [View on Etherscan](https://sepolia.etherscan.io/address/0xF3965f511c3b048fBE572d98abCf044837Adbc7B) |

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH ([Faucet](https://sepoliafaucet.com))

### Local Development

```bash
# Clone repository
git clone https://github.com/your-username/ShadowTrade.git
cd ShadowTrade

# Install dependencies
npm install
cd frontend && npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

### Smart Contract Deployment

```bash
# Compile contracts
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat compile

# Deploy to Sepolia
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" npx hardhat run scripts/deploy.js --network sepolia

# Update frontend config
# Edit frontend/.env with new contract address
```

## Usage Guide

### Creating a Strategy

1. **Connect Wallet**: Click "Connect Wallet" and select Sepolia network
2. **Navigate to Dashboard**: Access the strategy management interface
3. **Create Strategy Tab**: Configure your arbitrage parameters:
   - **Opportunity Type**: Spatial (cross-exchange), Temporal (time-based), Statistical (model-driven), or Triangular (multi-asset)
   - **Risk Tier**: Conservative, Moderate, or Aggressive
   - **Capital**: Initial allocation in ETH
   - **Exposure**: Maximum market exposure limit
   - **Target Return**: Desired profit target (basis points)
   - **Stop Loss**: Maximum acceptable loss (basis points)
   - **Max Slippage**: Tolerance for price slippage
   - **Venue Count**: Number of trading venues to utilize
   - **Confidence**: Strategy confidence score

4. **FHE Encryption**: Parameters are encrypted client-side using Zama's Relayer SDK
5. **Submit Transaction**: Confirm the transaction to store encrypted strategy on-chain

### Managing Strategies

| Action | Description |
|--------|-------------|
| **Activate** | Enable strategy for execution (validates against policy) |
| **Pause** | Temporarily halt execution |
| **Resume** | Continue paused strategy |
| **Complete** | Mark strategy as finished |

### Sharing Strategies

1. **Open Share Dialog**: Click "Share" button on any strategy card
2. **Enter Recipient Address**: Input the wallet address to share with
3. **Confirm Transaction**: Approve the `shareStrategy()` transaction
4. **Recipient Access**: The recipient can view the strategy in their "Shared With Me" tab
5. **Revoke Access**: Click the X button next to any shared user to revoke

### Viewing Shared Strategies

1. Navigate to **Dashboard** → **Shared With Me** tab
2. View all strategies that others have shared with you
3. Access includes: strategy type, risk tier, status, execution statistics
4. Note: Shared access is read-only

## FHE Deep Dive

### Encrypted Data Types

| Type | Size | Use Case |
|------|------|----------|
| `euint8` | 8-bit | Venue count, confidence scores |
| `euint16` | 16-bit | Slippage tolerance (basis points) |
| `euint32` | 32-bit | Return targets, stop loss (basis points) |
| `euint64` | 64-bit | Capital amounts, exposure limits, PnL |

### FHE Operations Used

```solidity
// Comparison operations for policy validation
FHE.ge(capitalCipher, FHE.asEuint64(minCapital))  // Greater than or equal
FHE.le(capitalCipher, FHE.asEuint64(maxCapital))  // Less than or equal

// Logical operations for compound conditions
FHE.and(condition1, condition2)  // Combine multiple validations

// Permission management for sharing
FHE.allow(ciphertext, recipientAddress)  // Grant read access
FHE.allowThis(ciphertext)  // Allow contract to operate on data
```

### Async Decryption Pattern

```solidity
// Request decryption via Gateway
uint256 requestId = Gateway.requestDecryption(
    cts,           // Array of ciphertexts to decrypt
    this.callback, // Callback function
    0,             // Request ID
    block.timestamp + 1 hours,  // Max wait time
    false          // Not trustless
);

// Callback receives plaintext results
function performanceReviewCallback(
    uint256 requestId,
    uint64 profitability,
    uint8 performanceBand
) external onlyGateway {
    // Process decrypted values
}
```

## Project Structure

```
ShadowTrade/
├── contracts/
│   └── CovertArbitrageDeck.sol    # Main FHE-enabled strategy contract
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateStrategyForm.tsx   # Strategy creation with FHE
│   │   │   ├── StrategyList.tsx         # Strategy management
│   │   │   ├── SharedStrategyList.tsx   # Received shares view
│   │   │   ├── ShareStrategyDialog.tsx  # Sharing interface
│   │   │   └── ui/                      # shadcn/ui components
│   │   ├── hooks/
│   │   │   └── useStrategies.ts         # Strategy & sharing hooks
│   │   ├── lib/
│   │   │   └── fhe.ts                   # FHE SDK integration
│   │   ├── config/
│   │   │   └── contract.ts              # Contract ABI & address
│   │   └── pages/
│   │       ├── Landing.tsx              # Home page
│   │       └── Dashboard.tsx            # Strategy management
│   └── index.html                       # COOP/COEP headers for FHE
├── scripts/
│   └── deploy.js                        # Deployment script
└── hardhat.config.js                    # Hardhat configuration
```

## Security Considerations

### FHE Security Model
- **Client-Side Encryption**: Sensitive data never leaves the user's browser unencrypted
- **On-Chain Privacy**: All stored values are ciphertexts, unreadable without decryption
- **Access Control**: `FHE.allow()` provides cryptographic access management
- **Gateway Decryption**: Only authorized requests can trigger decryption

### Smart Contract Security
- **Access Modifiers**: `onlyOwner`, `strategyExists`, `onlyGateway` guards
- **Validation**: Policy checks using FHE comparisons before activation
- **Immutable Storage**: Strategy parameters cannot be modified after creation

## Future Roadmap

- [ ] **Strategy Marketplace**: Public sharing with subscription model
- [ ] **Copy Trading**: Follow successful traders with privacy preservation
- [ ] **Multi-Chain Support**: Deploy on Arbitrum, Polygon, etc.
- [ ] **Advanced Analytics**: Encrypted performance aggregation
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **API Access**: Programmatic strategy management

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting PRs.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Zama](https://zama.ai) for fhEVM and Fully Homomorphic Encryption technology
- [RainbowKit](https://rainbowkit.com) for wallet connection
- [wagmi](https://wagmi.sh) for Ethereum hooks
- [shadcn/ui](https://ui.shadcn.com) for UI components

---

**ShadowTrade** - Trade with confidence. Keep your strategies private.
