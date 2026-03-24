# 🔱 MERIDIAN | Institutional DeFi Hub

**MERIDIAN** is a high-fidelity, institutional-grade yield aggregation and liquidity management protocol built on Solana. It combines state-of-the-art yield strategies with robust M-of-N multi-signature governance to provide a secure entry point for large-scale capital.

## 🚀 Key Features

### 💎 Institutional Premium UI
- **Beefy-Inspired Layout**: A high-density, data-rich interface designed for professional asset monitoring.
- **Deep Ocean Aesthetic**: A custom Obsidian and Gold design system optimized for modern institutional users.
- **Privacy Mode**: Integrated `Eye/EyeOff` toggle to mask sensitive balance and revenue data across the entire platform.
- **Protocol Matrix**: Real-time filtering by technology partners including **Kamino, Marginfi, Drift, Jito,** and **Ondo**.

### 🛡️ On-Chain Security
- **Multi-Sig Governance (M-of-N)**: Integrated transaction approval flows directly within the vault architecture.
- **High-Value Deposit Guard**: Automatic multi-sig enforcement for any deposit exceeding **1,000,000 USDC**.
- **Whitelist Controls**: Institutional-only access via authority-gated whitelisting.

### 📈 Optimized Yield Strategies
- **Dynamic Allocation**: Real-time balance rebalancing across leading Solana lending and staking protocols.
- **Risk Tiering**: Transparent risk labeling (**Conservative, Balanced, Aggressive**) to match institutional mandates.

---

## 🛠️ Project Structure

```bash
Projects/meridian/
├── meridian-full/      # Next.js 14+ Frontend (App Router, Solana Wallet Adapter)
└── meridian-program/   # Anchor (Solana) Smart Contract Source Code
```

---

## ⚙️ Technical Details

- **Program ID**: `FiBXeQkSGjq1WJQU4JhicwHtuWtv4SQ5pbdBzE9B1xnF`
- **Network**: Solana Devnet
- **Stack**: Next.js, Tailwind CSS, Framer Motion, Anchor Framework, @solana/web3.js

## 🚦 Getting Started

### 1. Frontend Setup
```bash
cd meridian-full
npm install
npm run dev
```
Accessible at: `http://localhost:3000`

### 2. Smart Contract
```bash
cd meridian-program
anchor build
anchor deploy --provider.cluster devnet
```

---

## 🔮 Roadmap
- [x] Full Beefy-style Vault List implementation.
- [x] On-chain program deployment to Devnet.
- [x] @solana/wallet-adapter-react integration.
- [ ] Direct multi-sig transaction execution from UI.
- [ ] Institutional Analytics Reports (Phase 2).

"Institutional Yield, **Secured.**" — **The MERIDIAN Team** 🔱
