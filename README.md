# Starknet Credit Score

**AI-powered credit scoring for Starknet wallets**

[![Live Demo](https://img.shields.io/badge/Live-Demo-%23EC5728?style=for-the-badge)](https://starknet-credit-score.vercel.app)
[![GitHub](https://img.shields.io/badge/Repo-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Borax0x0/starknet-credit-score)

---

## The Problem

Starknet lacks an identity layer. DeFi protocols can't differentiate between a seasoned power user and a fresh bot wallet. There's no standard way to assess wallet trustworthiness or build reputation on-chain. This limits lending, airdrops, and trust-based applications.

---

## What We Built

- **Credit Score** — Analyzes wallet age, transaction count, token diversity, and holdings to generate a 300-850 credit score with tier rankings (Poor → Excellent)

- **Wallet DNA** — Deterministic generative constellation art unique to each wallet address and score tier

- **AI Personality** — Groq-powered analysis that labels wallets as "DeFi Degen", "Diamond Hands", "Cautious Accumulator", and more

- **Starkzap Staking** — Real STRK staking with gasless transactions via Cartridge Controller, unlocked only for wallets with score ≥700

- **Leaderboard** — Top wallets ranked by credit score, stored in Supabase

---

## Starkzap Integration

Starkzap SDK powers the core wallet experience:

| Feature | Implementation |
|---------|---------------|
| Wallet Connection | `sdk.connectCartridge()` — one-click social login, no seed phrases |
| Gasless Staking | Cartridge Controller paymaster covers all gas fees |
| Score-Gated Access | UI locks staking behind 700+ credit score threshold |

```typescript
import { StarkZap, Amount } from 'starkzap';

export async function stakeSTRK(wallet, poolAddress, amount) {
  const sdk = new StarkZap({ network: 'mainnet' });
  const tokens = await sdk.stakingTokens();
  const STRK = tokens.find(t => t.symbol === 'STRK');
  
  const stakeAmount = Amount.parse(amount, STRK);
  const tx = await wallet.stake(poolAddress, stakeAmount);
  await tx.wait();
  
  return { txHash: tx.hash };
}
```

---

## Tech Stack

| Frontend | Backend | Infrastructure |
|----------|---------|----------------|
| Next.js 16.1 (App Router) | Next.js API Routes | Vercel |
| TypeScript | Starknet.js RPC | Supabase |
| Tailwind CSS v4 | Groq API (llama-3.3-70b) | dRPC |
| Framer Motion | Starkzap SDK | |
| Three.js / React Three Fiber | | |

---

## Score Algorithm

5 metrics mapped to a 300-850 credit score range:

| Metric | Weight | Measurement |
|--------|--------|-------------|
| Wallet Age | +150 max | Days since first transaction |
| Transaction Count | +150 max | Nonce via RPC |
| Token Diversity | +100 max | Unique token holdings |
| STRK Balance | +50 | Native STRK holdings |
| USDC Balance | +50 | Stablecoin holdings |
| Recent Activity | +100 | Days since last transaction |

**Tiers:** 750+ Excellent | 700-749 Very Good | 650-699 Good | 600-649 Fair | <600 Poor

---

## Run Locally

```bash
git clone https://github.com/Borax0x0/starknet-credit-score
cd starknet-credit-score
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_STARKNET_RPC_URL=https://your-rpc-url
GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Hackathon Submission

**Event:** Starkzap Developer Challenge  
**Dates:** February 24 – March 17, 2026  
**Track:** Best Overall / Most Creative

Built with ❤️ on Starknet using Starkzap SDK
