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
    if (redirectUrl) {
      redirect(redirectUrl);
    }
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
