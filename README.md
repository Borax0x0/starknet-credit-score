# Starknet Credit Score

AI-generated credit score and personality profile based on your Starknet wallet activity.

## Features

- Paste any Starknet wallet address to analyze
- Get a credit score (0-850) based on on-chain metrics
- AI-generated personality type (e.g., "Active Trader", "Diamond Hand")
- Connect wallet via Starkzap (Cartridge Controller)
- Downloadable shareable card

## Stack

- Next.js (App Router)
- Tailwind CSS
- Starkzap SDK (wallet connection)
- starknet.js (on-chain data)
- Groq / Llama 3.3 70B (AI personality)
- html2canvas (card download)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and add your Groq API key:
   ```bash
   cp .env.local.example .env.local
   ```
   Get a free API key at [console.groq.com](https://console.groq.com)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `GROQ_API_KEY` - Your Groq API key for AI personality generation

## How It Works

1. **Enter a wallet address** or connect via Starkzap
2. **On-chain metrics are fetched** from Starknet mainnet:
   - Transaction count (via nonce)
   - STRK and USDC balances
   - Wallet deployment status
3. **Credit score is calculated** (0–850) based on activity
4. **AI generates a personality** using Llama 3.3 via Groq
5. **Download and share** your score card

## Score Tiers

| Score | Tier |
|-------|------|
| 750+ | Excellent |
| 700–749 | Very Good |
| 650–699 | Good |
| 600–649 | Fair |
| Below 600 | Poor |

## Challenge Submission

This project is built for the Starkzap Developer Challenge.

### Submission Checklist

- [x] Public GitHub repository
- [x] README.md complete
- [ ] Live app link working
- [ ] PR raised on `awesome-starkzap` repo

## License

MIT
