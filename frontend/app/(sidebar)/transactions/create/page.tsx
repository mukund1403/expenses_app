import TransactionForm from '@/components/transactions/TransactionForm';

export default function TransactionsCreatePage() {
  return (
    <>
      <TransactionForm initialTransaction={null} />
    </>
  );
}
