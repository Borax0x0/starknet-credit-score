import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface PersonalityResult {
  type: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics, address } = body;

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

    const prompt = `You are a witty crypto analyst. Given this wallet data: 
wallet age: ${metrics.walletAgeDays} days, tx count: ${metrics.txCount}, unique tokens: ${metrics.uniqueTokens}, has STRK: ${metrics.hasSTRK}, has USDC: ${metrics.hasUSDC}, days since last tx: ${metrics.daysSinceLastTx}

Write a punchy 2-word personality type (e.g. Diamond Hand, Ghost Wallet, Chaos Agent, Silent Accumulator) and ONE sentence description that is specific, a little funny, and feels human. 
Never use the words "frequent", "engagement", or "categorized".

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

    if (supabase && address) {
      await supabase
        .from('wallet_scores')
        .update({ 
          personality_type: personality.type,
          personality_description: personality.description 
        })
        .eq('address', address.toLowerCase());
    }

    return NextResponse.json(personality);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
