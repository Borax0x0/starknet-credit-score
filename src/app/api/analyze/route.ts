import { NextRequest, NextResponse } from 'next/server';

interface PersonalityResult {
  type: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics } = body;

    if (!metrics) {
      return NextResponse.json({ error: 'Missing metrics' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    const prompt = `Given this Starknet wallet data: wallet age: ${metrics.walletAgeDays} days, transaction count: ${metrics.txCount}, unique tokens: ${metrics.uniqueTokens}, has STRK: ${metrics.hasSTRK}, has USDC: ${metrics.hasUSDC}, days since last transaction: ${metrics.daysSinceLastTx}

Generate a 2-word crypto personality type (like "Diamond Hand", "Yield Farmer", "Ghost Wallet", "Degen Trader", "Cautious Accumulator", "Active Trader", "HODLer") and one sentence explaining it.
Return ONLY valid JSON with this exact format: { "type": "...", "description": "..." }`;

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
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return NextResponse.json(
        { error: 'Failed to generate personality' },
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

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse personality' },
        { status: 500 }
      );
    }

    const personality: PersonalityResult = JSON.parse(jsonMatch[0]);

    return NextResponse.json(personality);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
