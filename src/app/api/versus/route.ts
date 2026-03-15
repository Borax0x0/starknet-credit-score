import { NextRequest, NextResponse } from 'next/server';

interface WalletData {
  personality: string;
  score: number;
  age: number;
  txs: number;
  tokens: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletA, walletB } = body;

    if (!walletA || !walletB) {
      return NextResponse.json({ error: 'Missing wallet data' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    const prompt = `You are a savage but funny crypto analyst. Compare these two Starknet wallets and write 2-3 sentences declaring a winner. Be specific, reference their actual stats. 
Wallet A: ${walletA.personality}, score ${walletA.score}, age ${walletA.age} days, ${walletA.txs} transactions, ${walletA.tokens} tokens. 
Wallet B: ${walletB.personality}, score ${walletB.score}, age ${walletB.age} days, ${walletB.txs} transactions, ${walletB.tokens} tokens. 
Be brutal but funny.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return NextResponse.json(
        { error: 'Failed to generate comparison' },
        { status: 500 }
      );
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'Invalid API response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ roast: content });
  } catch (error) {
    console.error('Versus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
