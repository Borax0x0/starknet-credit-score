# 🏦 Starknet Credit Score — Build Brief

## What you're building
A web app where anyone can paste a Starknet wallet address and get an AI-generated credit score + personality profile based on their on-chain activity. The output is a beautiful shareable card.

## Stack
- **Next.js** (App Router)
- **Starkzap SDK** (`npm install starkzap`) — wallet connection
- **Starknet.js** — reading on-chain data for any address
- **GLM-5/Minimax API** — generating the personality summary
- **Vercel** — deployment

---

## Pages to build

### 1. Home page (`/`)
- Big headline: *"Your wallet has a reputation. Find out what it says."*
- Input field: paste any Starknet wallet address
- Button: "Analyze Wallet"
- Also a "Connect my wallet" button via Starkzap

### 2. Score page (`/score/[address]`)
- Fetch these metrics from Starknet:
  - Wallet age (first transaction date)
  - Total transaction count
  - Unique tokens held
  - STRK/USDC balance
  - Last activity date
- Calculate a score 0–850 (like a credit score) from these metrics
- Send metrics to GLM-5 to generate a 2-line personality type (e.g. "Diamond Hand Degen", "Cautious Accumulator", "Ghost Wallet")
- Display: score number, score tier, personality label, metric breakdown
- "Share Card" button

### 3. Share card (`/card/[address]`)
- Clean OG-style card design
- Shows: wallet address (shortened), score, personality type, top 3 metrics
- Download as image button (use `html2canvas`)

---

## Starkzap wallet connection code
```ts
import { StarkZap, OnboardStrategy } from "starkzap";

const sdk = new StarkZap({ network: "mainnet" });
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Privy,
  deploy: "if_needed",
});
// after connect, redirect to /score/[wallet.address]
```

## Score calculation logic
```ts
function calculateScore(metrics) {
  let score = 300; // base
  if (metrics.walletAgeDays > 365) score += 150;
  else if (metrics.walletAgeDays > 180) score += 100;
  if (metrics.txCount > 100) score += 150;
  else if (metrics.txCount > 20) score += 80;
  if (metrics.uniqueTokens > 5) score += 100;
  if (metrics.hasSTRK) score += 50;
  if (metrics.hasUSDC) score += 50;
  if (metrics.daysSinceLastTx < 30) score += 100;
  return Math.min(score, 850);
}
```

## GLM-5 prompt for personality
```
Given this Starknet wallet data: {metrics}
Generate a 2-word crypto personality type (like "Diamond Hand", "Yield Farmer", 
"Ghost Wallet", "Degen Trader", "Cautious Accumulator") and one sentence explaining it.
Return JSON: { "type": "...", "description": "..." }
```

---

## Day Plan

| Day | Tasks |
|-----|-------|
| **Day 1** | Setup Next.js, install Starkzap, build home page + wallet connect, fetch on-chain metrics |
| **Day 2** | Score calculation, GLM-5 integration, score page UI |
| **Day 3** | Share card, polish, deploy to Vercel, write README, raise PR on awesome-starkzap |

---

## Submission Checklist
- [ ] PR raised on `awesome-starkzap` repo
- [ ] Public GitHub repository
- [ ] README.md complete
- [ ] Live app link working

---

## Docs & Links
- Starkzap docs: `docs.starknet.io/build/starkzap`
- Starkzap GitHub: `github.com/keep-starknet-strange/starkzap`
- Awesome Starkzap (for PR): search `awesome-starkzap` on GitHub
- Challenge deadline: **17th March 23:59 UTC**
