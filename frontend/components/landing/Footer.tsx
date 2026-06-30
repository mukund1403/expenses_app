'use client';

import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      sx={{
        py: 4,
        px: 2,
        textAlign: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant='body2' color='text.secondary'>
        AutoEx · Built for people who&apos;d rather not think about it
      </Typography>
    </Box>
  );
}
