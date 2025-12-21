import TransactionForm from '@/components/transactions/TransactionForm';

export default function TransactionsCreatePage() {
  return (
    <>
      <div>This is the Transactions Create Page.</div>
      <TransactionForm initialTransaction={null} />
    </>
  );
}
