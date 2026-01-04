import { Box, Card, CardContent, Divider, Typography } from '@mui/material';
import content from '@/contents/get_started.json';
import { WarningRounded } from '@mui/icons-material';
import React from 'react';

export function WarningCard() {
  return (
    <Card
      sx={{
        borderRadius: '0.5rem',
        borderWidth: '2px',
        borderColor: 'error.main',
        backgroundColor: 'background.paper',
        margin: '0.5rem',
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant='h4' sx={{ textAlign: 'center' }}>
          {content.warning.heading}
        </Typography>
        <Divider sx={{ my: 1 }}>
          <WarningRounded color='error' />
        </Divider>
        {content.warning.text.map((text, index) => (
          <Typography key={index} variant='body1' sx={{ my: 1 }}>
            {text}
          </Typography>
        ))}
        <Box
          component='img'
          src={content.warning.image.src}
          alt={content.warning.image.alt ?? ''}
          sx={{
            width: '100%',
            borderWidth: '1px',
            borderRadius: '4px', // Same as Alert
            borderColor: 'text.primary',
            display: 'block',
            my: 1,
          }}
        />
      </CardContent>
    </Card>
  );
}
