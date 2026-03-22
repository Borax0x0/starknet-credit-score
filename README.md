# Starknet Credit Score

> Your wallet has a reputation. Find out what it is.

**Live Demo:** https://starknet-credit-score.vercel.app  
**Built for:** Starkzap Developer Challenge 2026

---

## What Is This?

Starknet Credit Score is an on-chain identity and credit scoring 
app for Starknet wallets. Paste any Starknet address and get:

- A **credit score** (300–850) based on real on-chain activity
- A **Wallet DNA** — generative constellation art unique to your address
- An **AI personality profile** — are you a Diamond Hand or a Tx Tyrant?
- **Score-gated STRK staking** via Starkzap SDK
- A **shareable score card** to flex on Twitter

---

## The Problem

Starknet has no identity or reputation layer. Protocols can't 
differentiate between a 3-year DeFi veteran and a bot wallet 
deployed yesterday. There's no way to assess wallet 
trustworthiness or reward loyal ecosystem participants.

Starknet Credit Score is the first step toward fixing that.

---

## What We Built

### Credit Score Engine
Six on-chain metrics analyzed in real-time from Starknet mainnet:
- Wallet age (deployment block timestamp)
- Transaction count (account nonce)
- Token diversity (STRK, USDC, ETH, USDT, WBTC holdings)
- STRK balance
- USDC balance  
- Recent activity (days since last transaction)

Score range: 300–850 across five tiers:
Poor → Fair → Good → Very Good → Excellent

### Wallet DNA
Deterministic generative constellation art based on your wallet 
address and metrics. Same wallet always produces the same pattern. 
Tier-colored — gold for Excellent, purple for Very Good, teal for 
Good, orange for Fair, red for Poor.

### AI Personality Analysis
Powered by Groq (llama-3.3-70b). Generates a personality archetype 
and description based on your on-chain behavior. Examples: 
"Diamond Hand", "Tx Tyrant", "Rookie Rusher", "Token Tornado".

### Score-Gated Staking via Starkzap
Wallets scoring 700+ unlock STRK staking via Starkzap SDK with 
Cartridge Controller wallet connection. Lower scores see a locked 
panel showing exactly how many points they need to unlock access.

This makes the credit score actionable — it gates real on-chain 
behavior, not just informational display.

### Score Simulator
Interactive sliders let users simulate how improving each metric 
would change their score in real-time. Built on the existing 
scoring algorithm with no additional API calls.

### Leaderboard
Top wallets ranked by credit score, stored in Supabase. 
Cache-first architecture — previously analyzed wallets load 
instantly with no RPC call.

### Shareable Score Card
Every wallet gets a shareable card at `/card/[address]` with 
score, tier, personality, Wallet DNA art, and key metrics. 
Download or share directly to Twitter/X.

---

## Starkzap Integration

The Starkzap SDK is used for:

**Wallet Connection**
```typescript
const { StarkZap } = await import('starkzap')
const sdk = new StarkZap({ network })
const wallet = await sdk.connectCartridge()
```

**Score-Gated Staking**
```typescript
const pools = await sdk.getStakerPools()
const tokens = await sdk.stakingTokens()
await wallet.stake({
  amount: Amount.parse(stakeAmount, 18),
  validatorAddress: selectedPool
})
```

Staking is only accessible to wallets scoring 700+. This creates 
a direct link between on-chain reputation and protocol access — 
the core value proposition of the Starkzap challenge.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Animations | Framer Motion |
| Blockchain | Starknet.js, Starkzap SDK |
| AI | Groq API (llama-3.3-70b) |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Wallet | Cartridge Controller via Starkzap |

---

## Score Algorithm

| Metric | Max Points | Thresholds |
|---|---|---|
| Wallet Age | 150 | 30/90/180/365+ days |
| Transaction Count | 150 | 5/20/50/100+ txs |
| Token Diversity | 100 | 1/3/5+ tokens |
| STRK Balance | 50 | Holds any STRK |
| USDC Balance | 50 | Holds any USDC |
| Recent Activity | 100 | <7/<30/<90 days |
| Base Score | 300 | Always |
| **Maximum** | **850** | |

---

## Run Locally
```bash
# Clone the repo
git clone https://github.com/Borax0x0/starknet-credit-score
cd starknet-credit-score

# Install dependencies
npm install

# Add environment variables
cp .env.local.example .env.local
# Fill in your keys

# Run development server
npm run dev
```

### Environment Variables
```env
NEXT_PUBLIC_STARKNET_RPC_URL=your-rpc-url
GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Deployment

Auto-deploys to Vercel on push to `master` branch.  
Live at: https://starknet-credit-score.vercel.app

---

## Built By

[@0xborax](https://twitter.com/0xborax)  
Starkzap Developer Challenge — February 24 – March 23, 2026
```

---

## Awesome-Starkzap PR Description

**PR Title:**
```
Add Starknet Credit Score — on-chain identity and score-gated staking