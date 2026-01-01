import React from 'react';
import {
  Alert,
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
  FastForwardRounded,
  LooksOneRounded,
  LooksTwoRounded,
  Looks3Rounded,
  Looks4Rounded,
  Looks5Rounded,
  Looks6Rounded,
  RocketLaunchRounded,
} from '@mui/icons-material';
import content from '@/contents/get_started.json';

export function GetStarted() {
  const numberIconList = [
    LooksOneRounded,
    LooksTwoRounded,
    Looks3Rounded,
    Looks4Rounded,
    Looks5Rounded,
    Looks6Rounded,
  ];

  return (
    <>
      {/* INTRO */}
      <Card sx={cardStyles}>
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
          <Stack direction='row' spacing={1} sx={{ my: 2 }}>
            <LooksOneRounded color='primary' />
            <Typography variant='body1'>{content.intro.steps[0]}</Typography>
          </Stack>
          <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
            <LooksTwoRounded color='primary' />
            <Typography variant='body1'>{content.intro.steps[1]}</Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* EMAIL ALERTS */}
      <Card sx={cardStyles}>
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
          <Stack direction='row' spacing={1} sx={{ my: 2 }}>
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
          <Stack direction='row' spacing={1} sx={{ my: 2 }}>
            <LooksTwoRounded color='primary' />
            <Typography variant='body1'>
              {content.emailAlerts.steps[1].text}
            </Typography>
          </Stack>
          <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
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

      {/* AUTO FORWARDING */}
      <Card sx={cardStyles}>
        <CardContent>
          <Typography variant='h4' sx={{ textAlign: 'center' }}>
            {content.autoForwarding.heading}
          </Typography>
          <Divider sx={{ my: 1 }}>
            <FastForwardRounded color='primary' />
          </Divider>
          {content.autoForwarding.sections.map((section, index) => {
            const Icon = numberIconList[index];

            return (
              <Box
                key={index}
                sx={{
                  ...(index === content.autoForwarding.sections.length - 1
                    ? { mt: 2 }
                    : { my: 2 }),
                }}
              >
                <Stack direction='row' spacing={1}>
                  <Icon color='primary' />
                  <Typography variant='body1'>{section.heading}</Typography>
                </Stack>
                <Box
                  component='ul'
                  sx={{
                    pl: '2rem',
                    listStyleType: 'disc',
                  }}
                >
                  {section.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </Box>
                {section.notes && (
                  <Alert severity='info' sx={{ mt: 2, borderRadius: '0.5rem' }}>
                    <Box
                      component='ul'
                      sx={{
                        pl: 2,
                        listStyleType: 'disc',
                      }}
                    >
                      {section.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </Box>
                  </Alert>
                )}
              </Box>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}

const cardStyles = {
  borderRadius: '0.5rem',
  backgroundColor: 'background.paper',
  margin: '0.5rem',
  boxShadow: 3,
};
