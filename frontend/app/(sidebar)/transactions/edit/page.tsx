export default async function TransactionsEditPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const transaction_id = (await searchParams).transaction_id;

  return (
    <div>
      <h1>Edit Transaction</h1>
      <p>transaction_id: {transaction_id}</p>
    </div>
  );
}
