'use client';

const exchangeCode = async (code: string): Promise<{ isUserNew: boolean }> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_GOLANG_URL}/auth/exchange`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error('Failed to Exchange Code.');
  }

  const data = await res.json();

  // Persist JWT as HttpOnly cookie via server-side API
  const cookieRes = await fetch('/api/set-jwt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jwt: data.jwt }),
  });

  if (!cookieRes.ok) {
    throw new Error('Failed to Set Authentication Cookie.');
  }

  return { isUserNew: data.is_user_new === true }; // If field is empty return false
};

export default exchangeCode;
