import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Alert from '@mui/material/Alert';
import { CurrencySummary, Transaction } from '@/components/transactions/consts';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionOverview from '@/components/transactions/TransactionOverview';
import { getCurrencySummaryList } from '@/components/transactions/utils';

export default async function TransactionsPage() {
  const cookie = await cookies();

  let transactionList: Transaction[];
  let currencySummaryList: CurrencySummary[];

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
      if (redirectUrl) {
        redirect('/login');
      }
    }

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    const data = await res.json();

    transactionList = data['transaction_list'];
    currencySummaryList = getCurrencySummaryList(transactionList);
  } catch (e) {
    return <Alert severity='error'>Failed to fetch transaction data.</Alert>;
  }

  return (
    <>
      <TransactionOverview currencySummaryList={currencySummaryList} />
      <TransactionList transactionList={transactionList} />
    </>
  );
}
