import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Alert from '@mui/material/Alert';
import { Transaction } from '@/components/transactions/consts';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const cookie = await cookies();
  const jwt = cookie.get('token')?.value;

  if (!jwt) {
    redirect('/login');
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_GOLANG_URL}/transactions/`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      cache: 'no-store',
    },
  );

  if (res.status === 401) {
    redirect('/login');
  }

  let transactionList: Transaction[];

  try {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    const data = await res.json();

    transactionList = data['transaction_list'].sort(
      (a: Transaction, b: Transaction) => b.datetime.localeCompare(a.datetime),
    );
  } catch (e) {
    return <Alert severity='error'>Failed to fetch transaction data.</Alert>;
  }

  return <AnalyticsDashboard transactionList={transactionList} />;
}
