'use client';

import { useState } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { EditRounded, DeleteRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import deleteTransactionAction from '@/app/(sidebar)/transactions/edit/deleteTransactionAction';
import { useNotification } from '@/providers/NotificationProvider';

export default function TransactionRowActions({
  transaction_id,
}: {
  transaction_id: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const { showSnackbar } = useNotification();

  const handleDeleteConfirm = () => {
    setDialogOpen(false);
    deleteTransactionAction(transaction_id)
      .then(() => {
        showSnackbar('Transaction Deleted Successfully.', 'success');
        router.refresh();
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Failed to Delete Transaction.';
        showSnackbar(message, 'error');
      });
  };

  return (
    <>
      <IconButton
        href={`/transactions/edit?transaction_id=${transaction_id}`}
        size='small'
      >
        <EditRounded />
      </IconButton>
      <IconButton
        size='small'
        color='error'
        onClick={() => setDialogOpen(true)}
      >
        <DeleteRounded />
      </IconButton>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
