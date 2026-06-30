'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function FinalCTA() {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        px: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant='h3' fontWeight={700} sx={{ mb: 2 }}>
        Stop tracking. Start forwarding.
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}
      >
        Set it up once. Never manually log a transaction again.
      </Typography>
      <Button
        component={Link}
        href='/home'
        variant='contained'
        size='large'
        sx={{ px: 5 }}
      >
        Get Started — it&apos;s free
      </Button>
    </Box>
  );
}
