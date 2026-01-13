'use server';

import { Transaction } from '@/components/transactions/consts';
import { cookies } from 'next/headers';
import { getUpdatedFields } from '@/utils/utils';

const putTransactionAction = async (
  updatedTransaction: Transaction,
  initialTransaction: Transaction,
): Promise<void> => {
  const updatedFields = getUpdatedFields(
    updatedTransaction,
    initialTransaction,
    ['transaction_id'],
  );
  const payload = {
    transaction_id: initialTransaction.transaction_id,
    ...updatedFields,
  };

  const cookie = await cookies();

  return new Promise(async (resolve, reject) => {
    const jwt = cookie.get('token')?.value; // retrieve JWT from HttpOnly cookie

    if (!jwt) {
      reject(new Error('Failed to Update Transaction.'));
    }
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GOLANG_URL}/transactions/`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`, // send JWT as Bearer token
          },
          body: JSON.stringify(payload),
          method: 'PUT',
          cache: 'no-store',
        },
      );

      if (res.ok) {
        resolve();
      } else {
        reject(new Error('Failed to Update Transaction.'));
      }
    } catch (err) {
      // TODO: Handle errors properly
      reject(new Error('Failed to Update Transaction.'));
    }
  });
};

export default putTransactionAction;
