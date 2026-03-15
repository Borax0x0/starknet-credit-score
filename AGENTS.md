# AGENTS.md - Agentic Coding Guidelines

## Overview

This is a Next.js 16 application with TypeScript that generates credit scores and personality profiles for Starknet wallet addresses. The app uses the App Router, Starknet.js for blockchain data, and Starkzap for wallet connection.

## Build, Lint, and Test Commands

### Development
```bash
npm run dev        # Start development server at http://localhost:3000
```

### Build & Production
```bash
npm run build      # Create production build
npm run start      # Start production server
npm run lint       # Run ESLint (uses next/core-web-vitals + next/typescript)
```

### Running a Single Test
This project currently has **no test framework configured**. There are no test files. To add tests:
```bash
# Install a test framework (example with Vitest + React Testing Library)
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Then run tests
npx vitest
```

For single-file testing:
```bash
npx vitest run src/lib/starknet.test.ts
```

## Code Style Guidelines

### Imports and Path Aliases
- Use `@/` for absolute imports from `src/` directory
- Group imports: React/Next imports first, then third-party, then local
- Client components must have `'use client'` at the top

```typescript
'use client';

import { useEffect, useState } from 'react';
import { some } from 'lib';
import { WalletMetrics } from '@/lib/starknet';
import { MyComponent } from '@/components/MyComponent';
```

### TypeScript Conventions
- **Always enable strict mode** - this project uses `"strict": true` in tsconfig.json
- Use explicit types for function parameters and return types
- Interface names: `PascalCase` (e.g., `WalletMetrics`, `WalletDNAProps`)
- Type aliases: `PascalCase` (e.g., `type MyType = ...`)
- Use `Record<K, V>` for dictionary types instead of plain objects

```typescript
interface WalletMetrics {
  walletAgeDays: number;
  txCount: number;
  uniqueTokens: number;
}

// Error typing in catch blocks
catch (err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);
  }
}
```

### Naming Conventions
- **Variables/functions**: `camelCase`
- **Components**: `PascalCase`
- **Files**:
  - Components: `PascalCase.tsx` (e.g., `WalletDNA.tsx`)
  - Utils/hooks: `camelCase.ts` (e.g., `useWalletAnalysis.ts`)
  - API routes: `route.ts` in directory-based routing

### Formatting
- Use 2 spaces for indentation
- Trailing commas in objects/arrays
- Prefer arrow functions for callbacks
- Use meaningful variable names
- Keep lines under 100 characters when practical

### Error Handling
- Use try/catch blocks for async operations
- Log errors with `console.error()` in API routes and server-side code
- Return user-friendly error messages in API responses
- Use `NextResponse.json({ error: '...' }, { status: ... })` for API errors

```typescript
try {
  const data = await fetchSomething();
  return NextResponse.json({ data });
} catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { error: 'User-friendly error message' },
    { status: 500 }
  );
}
```

### Component Structure
- Define component props using interfaces with `Props` suffix
- Use React hooks (`useState`, `useEffect`, `useRef`) for client-side state
- Extract complex logic into custom hooks (see `useWalletAnalysis.ts`)
- Use functional components exclusively

```typescript
interface WalletDNAProps {
  address: string;
  metrics: Partial<WalletMetrics> | null;
  size?: number;
}

export function WalletDNA({ address, metrics, size = 400 }: WalletDNAProps) {
  // Component logic
}
```

### API Routes
- Place in `src/app/api/[endpoint]/route.ts`
- Use appropriate HTTP methods (`GET`, `POST`, etc.)
- Validate request parameters and return 400 for bad requests
- Use URL search params for GET requests, body for POST

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Missing address' }, { status: 400 });
  }
  // ...
}
```

### State Management
- Use React `useState` for local component state
- Use custom hooks to share stateful logic
- Server-side data fetching in API routes (avoids CORS issues)

### Tailwind CSS
- Use Tailwind utility classes for styling
- Use arbitrary values when needed: `style={{ color: 'rgba(255,255,255,0.3)' }}`
- Follow responsive design patterns with `md:`, `lg:` prefixes

### Environment Variables
- Use `.env.local` for local development
- Prefix public variables with `NEXT_PUBLIC_`
- Never commit secrets to version control
- Required variables:
  - `NEXT_PUBLIC_STARKNET_RPC_URL` - Starknet RPC endpoint
  - `GROQ_API_KEY` - For AI personality generation
  - `STARKSCAN_API_KEY` - Optional, for accurate tx data

### File Organization
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── card/          # Dynamic routes
│   ├── score/         # Dynamic routes
│   ├── layout.tsx     # Root layout
│   └── page.tsx      # Home page
├── components/         # React components
└── lib/               # Utility functions and hooks
```

### Key Libraries
- **Next.js 16** - Framework with App Router
- **starknet.js v9** - Starknet blockchain interaction
- **starkzap v1** - Wallet connection via Cartridge Controller
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety (strict mode)

### Testing Guidelines
When adding tests:
- Use Vitest for unit tests
- Use React Testing Library for component tests
- Follow Arrange-Act-Assert pattern
- Test API routes with supertest or MSW
- Place tests next to source files: `component.tsx` → `component.test.tsx`
