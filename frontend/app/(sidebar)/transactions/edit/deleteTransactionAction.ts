'use server';

import { cookies } from 'next/headers';

const deleteTransactionAction = async (
  transaction_id: string,
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
          body: JSON.stringify({ transaction_id: transaction_id }),
          method: 'DELETE',
          cache: 'no-store',
        },
      );

      if (res.ok) {
        resolve();
      } else {
        reject(new Error('Failed to Delete Transaction.'));
      }
    } catch (err) {
      // TODO: Handle errors properly
      reject(new Error('Failed to Delete Transaction.'));
    }
  });
};

export default deleteTransactionAction;
