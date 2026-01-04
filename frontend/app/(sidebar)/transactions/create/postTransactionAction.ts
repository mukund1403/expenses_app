'use server';

import { Transaction } from '@/components/transactions/consts';
import { cookies } from 'next/headers';

const postTransactionAction = async (
  transaction: Transaction,
): Promise<void> => {
  const cookie = await cookies();
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GOLANG_URL}/transactions/`,
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookie.toString(),
          },
          body: JSON.stringify(transaction),
          method: 'POST',
          cache: 'no-store',
          redirect: 'manual',
        },
      );

      if (res.ok) {
        resolve();
      } else {
        reject(new Error('Failed to Create Transaction.'));
      }
    } catch (err) {
      // TODO: Handle errors properly
      reject(new Error('Failed to Create Transaction.'));
    }
  });
};

export default postTransactionAction;
