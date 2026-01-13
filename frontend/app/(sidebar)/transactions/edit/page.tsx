import Alert from '@mui/material/Alert';
import { cookies } from 'next/headers';
import { Transaction } from '@/components/transactions/consts';
import { redirect } from 'next/navigation';
import TransactionForm from '@/components/transactions/TransactionForm';

export default async function TransactionsEditPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const transaction_id = (await searchParams).transaction_id;
  if (!transaction_id || Array.isArray(transaction_id)) {
    return <Alert severity='error'>Transaction not found.</Alert>;
  }

  let transaction: Transaction;

  const cookie = await cookies();
  const jwt = cookie.get('token')?.value; // retrieve JWT from HttpOnly cookie

  if (!jwt) {
    redirect('/login'); // no JWT → redirect to login
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_GOLANG_URL}/transactions/`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`, // send JWT as Bearer token
      },
      cache: 'no-store',
    },
  );

  if (res.status === 401) {
    redirect('/login'); // token invalid/expired → redirect
  }

  try {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    const data = await res.json();

    transaction = data['transaction_list'].find(
      (t: Transaction) => t.transaction_id === transaction_id,
    );
    if (!transaction) {
      return <Alert severity='error'>Transaction not found.</Alert>;
    }
  } catch (e) {
    return <Alert severity='error'>Failed to fetch transaction data.</Alert>;
  }

  return <TransactionForm type='edit' initialTransaction={transaction} />;
}
