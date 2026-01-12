'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const isUserNew = searchParams.get('is_user_new') === 'true';

    if (!code) {
      setError('Missing authorization code.');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_GOLANG_URL}/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to exchange code.');
        }
        return res.json();
      })
      .then(async (data) => {
        // Persist JWT as HttpOnly cookie via server-side API
        const cookieRes = await fetch('/api/set-jwt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jwt: data.jwt }),
        });

        if (!cookieRes.ok) {
          throw new Error('Failed to set authentication cookie.');
        }

        // Redirect user based on isUserNew flag
        router.push(isUserNew ? '/settings/get_started' : '/home');
      })
      .catch((err: any) => {
        console.error(err);
        setError(err.message || 'Something went wrong.');
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="80vh"
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
          <Typography variant="h5" gutterBottom>
            Welcome to AutoEx!
          </Typography>
          <Typography variant="body1" gutterBottom>
            Signing you in. Please wait...
          </Typography>
          <Box mt={2} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
