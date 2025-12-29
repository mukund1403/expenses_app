'use server';

import { cookies } from 'next/headers';

const deleteTransactionAction = async (
  transaction_id: string,
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
          body: JSON.stringify({ transaction_id: transaction_id }),
          method: 'DELETE',
          cache: 'no-store',
          redirect: 'manual',
        },
      );

      if (res.ok) {
        resolve();
      } else {
        reject(new Error('Failed to delete Transaction'));
      }
    } catch (err) {
      // TODO: Handle errors properly
      reject(new Error('Failed to delete Transaction'));
    }
  });
};

export default deleteTransactionAction;
