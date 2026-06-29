import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Alert from '@mui/material/Alert';
import { CurrencySummary, Transaction } from '@/components/transactions/consts';
import TransactionList from '@/components/transactions/TransactionList';

export default async function TransactionsPage() {
  const cookie = await cookies();

  const jwt = cookie.get('token')?.value; // retrieve JWT from HttpOnly cookie

  if (!jwt) {
    redirect('/login'); // no JWT → redirect to login
  }

  let transactionList: Transaction[];

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

    transactionList = data['transaction_list'].sort(
      // TODO: implement sorting filter, descending `datetime` for now
      (a: Transaction, b: Transaction) => b.datetime.localeCompare(a.datetime),
    );
  } catch (e) {
    return <Alert severity='error'>Failed to fetch transaction data.</Alert>;
  }

  return (
    <>
      return <TransactionList transactionList={transactionList} />;
    </>
  );
}
