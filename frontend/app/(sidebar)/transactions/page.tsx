import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Alert from '@mui/material/Alert';
import { Transaction } from '@/components/transactions/consts';
import TransactionList from '@/components/transactions/TransactionList';
import { Box } from '@mui/material';

export default async function TransactionsPage() {
  const cookie = await cookies();

  let transactions: Transaction[];

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
    transactions = data['transaction_list'];
  } catch (e) {
    return <Alert severity='error'>Failed to fetch transaction data.</Alert>;
  }

  return (
    <>
      <div>This is the Transactions Page</div>
      <Box
        sx={{
          borderRadius: '0.5rem',
          backgroundColor: 'background.paper',
          margin: '0.5rem',
        }}
      >
        <TransactionList transactions={transactions} />
      </Box>
    </>
  );
}
