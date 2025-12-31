import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import {
  EmailRounded,
  LooksOneRounded,
  LooksTwoRounded,
  Looks3Rounded,
  RocketLaunchRounded,
} from '@mui/icons-material';
import content from '@/contents/get_started.json';

export function GetStarted() {
  return (
    <>
      <Card
        sx={{
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
          <Typography variant='body1' sx={{ mb: 1 }}>
            {content.intro.subheading1}
          </Typography>
          <Typography variant='body1' sx={{ mb: 1 }}>
            {content.intro.subheading2}
          </Typography>
          <Stack direction='row' spacing={1}>
            <LooksOneRounded color='primary' />
            <Typography variant='body1' sx={{ mb: 1 }}>
              {content.intro.steps[0]}
            </Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <LooksTwoRounded color='primary' />
            <Typography variant='body1'>{content.intro.steps[1]}</Typography>
          </Stack>
        </CardContent>
      </Card>
      <Card
        sx={{
          borderRadius: '0.5rem',
          backgroundColor: 'background.paper',
          margin: '0.5rem',
          boxShadow: 3,
        }}
      >
        <CardContent>
          <Typography variant='h4' sx={{ textAlign: 'center' }}>
            {content.emailAlerts.heading}
          </Typography>
          <Divider sx={{ my: 1 }}>
            <EmailRounded color='primary' />
          </Divider>
          <Typography variant='body1' sx={{ mb: 1 }}>
            {content.emailAlerts.description}
          </Typography>
          <Stack direction='row' spacing={1}>
            <LooksOneRounded color='primary' />
            <Typography variant='body1'>
              {content.emailAlerts.steps[0].text}{' '}
              <Link
                href={content.emailAlerts.steps[0].link?.url}
                target='_blank'
                rel='noopener noreferrer'
              >
                {content.emailAlerts.steps[0].link?.label}
              </Link>
            </Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <LooksTwoRounded color='primary' />
            <Typography variant='body1'>
              {content.emailAlerts.steps[1].text}
            </Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Looks3Rounded color='primary' />
            <Typography variant='body1'>
              {content.emailAlerts.steps[2].text}
            </Typography>
          </Stack>
          <Alert severity='info' sx={{ mt: 2, borderRadius: '0.5rem' }}>
            <Box
              component='ul'
              sx={{
                pl: 2,
                listStyleType: 'disc',
              }}
            >
              {content.emailAlerts.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </Box>
          </Alert>
        </CardContent>
      </Card>
    </>
  );
}
