'use client';

import { Button, Container, Typography, Box, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage() {
  // TODO: Implement error query params

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
