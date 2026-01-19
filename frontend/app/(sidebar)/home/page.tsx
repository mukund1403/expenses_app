import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Alert from '@mui/material/Alert';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import Link from 'next/link';
import React from 'react';

type UserDetailsResponse = {
  name: string;
  registered_email: string;
  forwarding_email: string;
};

export default async function HomePage() {
  // Placeholder logic to ping backend route to find if user is authenticated
  // TODO: Replace with `/home` with relevant features
  const cookieStore = await cookies();

  const jwt = cookieStore.get('token')?.value; // retrieve JWT from HttpOnly cookie

  if (!jwt) {
    redirect('/login'); // no JWT → redirect to login
  }

  let userDetails: UserDetailsResponse;

  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_GOLANG_URL}/settings/user_details`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`, // send JWT as Bearer token
      },
      cache: 'no-store',
    },
  );

  if (userRes.status === 401) {
    redirect('/login'); // token invalid/expired → redirect
  }

  try {
    if (!userRes.ok) {
      throw new Error(`Failed to fetch user details: ${userRes.status}`);
    }

    userDetails = await userRes.json();
  } catch (e) {
    return (
      <Alert severity='error'>
        Failed to retrieve user details. Please try again later.
      </Alert>
    );
  }

  // TODO: Move UI Logic into `/components`
  return (
    <>
      {/* Header */}
      <Box sx={{ m: '1rem' }}>
        <Typography variant='h4' gutterBottom>
          Hi {userDetails.name}! Welcome to AutoEx 👋
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Your all-in-one platform to track spending, manage budgets, and gain
          insights into your finances.
        </Typography>
      </Box>

      {/* Optional next steps */}
      <Box sx={{ m: '1rem' }}>
        <Typography variant='h6' gutterBottom>
          🚀 Getting started
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          If you’re new here, go to Settings and scroll to Activation link to
          setup your auto forwarding.
        </Typography>
      </Box>

      {/* Main Navigation Cards */}
      <Grid container spacing={1} sx={{ m: '0.5rem' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Link href='/transactions' style={{ textDecoration: 'none' }}>
            <Card sx={{ height: '100%', cursor: 'pointer' }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  💳 Transactions
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  View and search through all your transactions in one place.
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Link href='/budgets' style={{ textDecoration: 'none' }}>
            <Card sx={{ height: '100%', cursor: 'pointer' }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  📊 Budgets
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Set spending limits and keep your finances on track.
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Link href='/analytics' style={{ textDecoration: 'none' }}>
            <Card sx={{ height: '100%', cursor: 'pointer' }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  📈 Analytics
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Get insights into your spending patterns and trends.
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Link href='/settings' style={{ textDecoration: 'none' }}>
            <Card sx={{ height: '100%', cursor: 'pointer' }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  ⚙️ Settings
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Manage your account, preferences, and integrations.
                </Typography>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      </Grid>
    </>
  );
}
