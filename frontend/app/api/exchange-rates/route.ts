import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const base = req.nextUrl.searchParams.get('base');

  if (!base) {
    return NextResponse.json({ error: 'Missing base currency' }, { status: 400 });
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`,
      { cache: 'no-store' },
    );

    if (!res.ok) {
      throw new Error(`Exchange rate API error: ${res.status}`);
    }

    const data = await res.json();

    if (data.result !== 'success') {
      throw new Error(`Exchange rate API failed: ${data['error-type']}`);
    }

    return NextResponse.json({
      base,
      rates: data.conversion_rates,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}