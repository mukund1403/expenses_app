import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Alert from '@mui/material/Alert';

export default async function TransactionsPage() {
  const cookie = await cookies();

  let data;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_GOLANG_URL}/transactions/`,
      {
        headers: {
          Cookie: cookie.toString(),
        },
        method: 'GET',
        cache: 'no-store',
        redirect: 'manual',
      },
    );

    if (res.status >= 300 && res.status < 400) {
      const redirectUrl = res.headers.get('Location');
      console.log('redirectUrl', redirectUrl);
      if (redirectUrl) {
        redirect('/login');
      }
    }

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    data = await res.json();
  } catch (e) {
    return <Alert severity='error'>Failed to fetch transaction data.</Alert>;
  }

  console.log(data);

  return <div>This is the Transactions Page</div>;
}
