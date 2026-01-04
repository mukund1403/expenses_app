import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import content from '@/contents/get_started.json';
import {
  LooksOneRounded,
  LooksTwoRounded,
  RocketLaunchRounded,
} from '@mui/icons-material';
import React from 'react';

export function IntroCard() {
  const numberIconList = [LooksOneRounded, LooksTwoRounded];

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
          {content.intro.heading}
        </Typography>
        <Divider sx={{ my: 1 }}>
          <RocketLaunchRounded color='primary' />
        </Divider>
        {content.intro.text.map((text, index) => (
          <Typography key={index} variant='body1' sx={{ my: 1 }}>
            {text}
          </Typography>
        ))}
        {content.intro.steps.map((step, index) => {
          const Icon = numberIconList[index];

          return (
            <Stack key={index} direction='row' spacing={1} sx={{ my: 1 }}>
              <Icon color='primary' />
              {step.text.map((text, index) => (
                <Typography key={index} variant='body1'>
                  {text}
                </Typography>
              ))}
            </Stack>
          );
        })}
      </CardContent>
    </Card>
  );
}
