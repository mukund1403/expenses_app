'use client';

import { Button, Container, Typography, Box, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage({
  searchParams,
}: {
  searchParams: {
    error?: string;
  };
}) {
  const errorParam = searchParams.error;

  // Map error query params to user-friendly messages
  const errorMessages: Record<string, string> = {
    login_failed:
      'There is an issue with our system right now. Please try again later.',
    oauth_failed:
      'There has been an issue signing in with Google. Please check your account or try again.',
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_GOLANG_URL}/auth/oauth`;
  };

  return (
    <Container
      maxWidth='sm'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      <Box mb={4}>
        <Typography variant='h3' gutterBottom>
          Welcome to AutoEx!
        </Typography>
        <Typography variant='subtitle1' color='textSecondary'>
          Sign in to get started
        </Typography>
      </Box>

      {errorParam && (
        <Alert severity='error' sx={{ mb: 3, width: '100%' }}>
          {errorMessages[errorParam] ??
            'An unknown error occurred. Please try again.'}
        </Alert>
      )}

      <Button
        variant='contained'
        startIcon={<GoogleIcon />}
        sx={{
          backgroundColor: '#4285F4',
          color: '#fff',
          px: 4,
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          '&:hover': {
            backgroundColor: '#357ae8',
          },
        }}
        onClick={handleGoogleLogin}
      >
        Sign in with Google
      </Button>
    </Container>
  );
}
