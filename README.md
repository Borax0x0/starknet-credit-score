# 🏦 Starknet Credit Score

> **Your wallet has a reputation. Find out what it says.**

A web app that turns any Starknet wallet address into an AI-generated credit score and personality profile — shareable as a card on Twitter/X.

🔗 **Live App:** [your-vercel-url-here]

---

## What it does

Paste any Starknet wallet address and get:

- **A credit score (0–850)** based on real on-chain activity
- **An AI-generated personality type** — are you a Diamond Hand, a Ghost Wallet, or a Degen Trader?
- **A shareable card** — download as PNG and flex on Twitter

No wallet required to look up any address. Connect your own wallet via Starkzap to analyze yourself instantly.

---

## Screenshots

> *(add screenshots here)*

---

## How the score is calculated

| Metric | How it's measured |
|--------|------------------|
| Wallet age | First deployment date |
| Transaction count | Nonce as proxy via standard RPC |
| Asset diversity | Unique tokens held |
| Holdings | STRK + USDC balances |
| Recent activity | Days since last transaction |

**Score tiers:**
- 750–850 → 💎 Excellent
- 650–749 → 🟢 Good
- 550–649 → 🟡 Fair
- 400–549 → 🟠 Poor
- 300–399 → 👻 Ghost Wallet

---

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **Starkzap SDK** — wallet connection via Cartridge Controller
- **Starknet.js** — on-chain data fetching
- **Groq API** (llama-3.3-70b) — AI personality generation
- **html2canvas** — shareable card download
- **Vercel** — deployment

---

## Built with Starkzap

This project uses Starkzap for:
- **Wallet connection** — one-click social login via Cartridge Controller (no seed phrases)
- **On-chain data** — reading balances and wallet state
- **Account abstraction** — seamless UX for users new to crypto

---

## Running locally

```bash
git clone https://github.com/Borax0x0/starknet-credit-score
cd Projects/starknet_credit_score
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_STARKNET_RPC_URL=your_zan_or_alchemy_rpc_url
GROQ_API_KEY=your_groq_api_key
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Submission

Built for the [Starkzap Developer Challenge](https://forms.reform.app/starkware/StarkzapChallenge/4tabca) — Feb 24 to Mar 17, 2025.
