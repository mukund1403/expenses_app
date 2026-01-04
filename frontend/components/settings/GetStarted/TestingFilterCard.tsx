import { Card, CardContent, Divider, Typography } from '@mui/material';
import content from '@/contents/get_started.json';
import { ScienceRounded } from '@mui/icons-material';
import React from 'react';

export function TestingFilterCard() {
  return (
    <Card
      sx={{
        maxWidth: '1000px',
        borderRadius: '0.5rem',
        backgroundColor: 'background.paper',
        margin: '0.5rem',
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant='h4' sx={{ textAlign: 'center' }}>
          {content.testingFilter.heading}
        </Typography>
        <Divider sx={{ my: 1 }}>
          <ScienceRounded color='primary' />
        </Divider>
        {content.testingFilter.text.map((text, index) => (
          <Typography key={index} variant='body1' sx={{ my: 1 }}>
            {text}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
}
