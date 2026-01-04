'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';

type SnackbarType = 'info' | 'success' | 'error';

type SnackbarState = {
  open: boolean;
  message: string;
  type: SnackbarType;
  duration: number;
};

type NotificationContextType = {
  showSnackbar: (
    message: string,
    type?: SnackbarType,
    duration?: number,
  ) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    type: 'success',
    duration: 3000,
  });

  const showSnackbar = (
    message: string,
    type: SnackbarType = 'info',
    duration: number = 3000,
  ) => {
    setSnackbar({
      open: true,
      message: message,
      type: type,
      duration: duration,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.duration}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.type}
          variant='filled'
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return ctx;
}
