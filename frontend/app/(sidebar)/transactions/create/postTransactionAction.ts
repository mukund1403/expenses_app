'use server';

import { Transaction } from '@/components/transactions/consts';
import { cookies } from 'next/headers';

const postTransactionAction = async (
  transaction: Transaction,
): Promise<void> => {
  const cookie = await cookies();

  return new Promise(async (resolve, reject) => {
    const jwt = cookie.get('token')?.value; // retrieve JWT from HttpOnly cookie

    if (!jwt) {
      reject(new Error('Failed to Create Transaction.'));
    }
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GOLANG_URL}/transactions/`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`, // send JWT as Bearer token
          },
          body: JSON.stringify(transaction),
          method: 'POST',
          cache: 'no-store',
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
