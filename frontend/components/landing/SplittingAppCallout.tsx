'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { ArrowForwardRounded } from '@mui/icons-material';

export default function SplitwiseCallout() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, px: 2 }}>
      <Box
        sx={{
          maxWidth: 800,
          mx: 'auto',
          borderRadius: '1rem',
          background:
            'linear-gradient(135deg, rgba(155,135,248,0.12), rgba(155,135,248,0.02))',
          border: '1px solid',
          borderColor: 'primary.main',
          p: { xs: 4, md: 6 },
          textAlign: 'center',
        }}
      >
        <Typography
          variant='overline'
          color='primary.main'
          fontWeight={700}
          letterSpacing={1.5}
        >
          For the spreadsheet-and-app crowd
        </Typography>

        <Typography variant='h4' fontWeight={700} sx={{ mt: 1, mb: 2 }}>
          Already using an expense splitting app?
        </Typography>

        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 4, maxWidth: 560, mx: 'auto' }}
        >
          You settle up once a month and the numbers land back in your bank
          account — but they never quite make it into your real expense tracker.
          Upload that spreadsheet export and AutoEx slots every shared expense
          into the same place as everything else you spend.
        </Typography>

        <Button
          component={Link}
          href='/home'
          variant='contained'
          size='large'
          endIcon={<ArrowForwardRounded />}
          sx={{ px: 4 }}
        >
          Try the import
        </Button>
      </Box>
    </Box>
  );
}
