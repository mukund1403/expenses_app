import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { jwt } = await req.json();
  if (!jwt) {
    return NextResponse.json({ error: 'Missing JWT' }, { status: 400 });
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set('token', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // or 'none' if your frontend is cross-site
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return res;
}
