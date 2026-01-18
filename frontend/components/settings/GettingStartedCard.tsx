'use client';

import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

export default function GettingStartedCard() {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Getting Started
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          New to AutoEx or want a refresher? Revisit the setup guide to
          configure email forwarding and start tracking your expenses.
        </Typography>

        <Box>
          <Button
            component={Link}
            href='/settings/get_started'
            variant='contained'
            size='small'
          >
            Open Getting Started
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
