'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import exchangeCode from '@/app/auth/exchangeCode';
import Alert from '@mui/material/Alert';

export default function AuthCard({
  code,
  isUserNew,
}: {
  code: string;
  isUserNew: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    exchangeCode(code)
      .then(() => {
        router.push(isUserNew ? '/settings/get_started' : 'home');
      })
      .catch((err: unknown) => {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to Exchange Code.');
        }
      });
  }, [code, isUserNew, router]);

  if (error) {
    return <Alert severity='error'>{error}</Alert>;
  }

  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      height='80vh'
    >
      <Card
        sx={{
          p: 4,
          minWidth: 300,
          boxShadow: 3,
          borderRadius: 3,
          textAlign: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <CardContent>
          <Typography variant='h5' gutterBottom>
            Welcome to AutoEx!
          </Typography>
          <Typography variant='body1' gutterBottom>
            Signing you in. Please wait...
          </Typography>
          <Box mt={2} display='flex' justifyContent='center'>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
