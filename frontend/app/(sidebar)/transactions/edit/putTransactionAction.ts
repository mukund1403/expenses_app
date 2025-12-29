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
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GOLANG_URL}/transactions/`,
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookie.toString(),
          },
          body: JSON.stringify(payload),
          method: 'PUT',
          cache: 'no-store',
          redirect: 'manual',
        },
      );

      if (res.ok) {
        resolve();
      } else {
        reject(new Error('Failed to submit Transaction'));
      }
    } catch (err) {
      // TODO: Handle errors properly
      reject(new Error('Failed to submit Transaction'));
    }
  });
};

export default putTransactionAction;
