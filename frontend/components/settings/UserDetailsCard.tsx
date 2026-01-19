'use client';

import { Card, CardContent, Typography, Stack, Button } from '@mui/material';
import { LogoutRounded } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

type Props = {
  name: string;
  registeredEmail: string;
};

export default function UserDetailsCard({ name, registeredEmail }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  };

  return (
    <Card
      sx={{
        borderRadius: '0.5rem',
        backgroundColor: 'background.paper',
        margin: '0.5rem',
        overflow: 'hidden',
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant='h6' gutterBottom>
          User Details
        </Typography>

        <Stack spacing={1}>
          <Typography variant='body2' color='text.secondary'>
            Name
          </Typography>
          <Typography variant='body1'>{name}</Typography>

          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Registered Email
          </Typography>
          <Typography variant='body1'>{registeredEmail}</Typography>
        </Stack>

        <Button
          sx={{ mt: 2 }}
          variant='outlined'
          color='error'
          startIcon={<LogoutRounded />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </CardContent>
    </Card>
  );
}
