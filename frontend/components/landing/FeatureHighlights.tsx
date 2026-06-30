'use client';

import { Box, Typography, Grid } from '@mui/material';
import {
  MailRounded,
  PublicRounded,
  PieChartRounded,
  UploadFileRounded,
} from '@mui/icons-material';
import { ElementType } from 'react';
import { SvgIconProps } from '@mui/material';

interface Feature {
  title: string;
  description: string;
  icon: ElementType<SvgIconProps>;
}

const features: Feature[] = [
  {
    title: 'Fully automated',
    description:
      'Forward your bank emails once. Every transaction after that logs itself — no manual entry, ever.',
    icon: MailRounded,
  },
  {
    title: 'Multi-currency, built in',
    description:
      'Spending across borders? Every currency is tracked natively and converted automatically when you need a total.',
    icon: PublicRounded,
  },
  {
    title: 'Real analytics',
    description:
      'See exactly where your money goes with category breakdowns, pie charts, and bar charts — not just a list.',
    icon: PieChartRounded,
  },
  {
    title: 'Import from anywhere',
    description:
      'Already settle up with friends on a spreadsheet? Upload it and bring every shared expense into one place.',
    icon: UploadFileRounded,
  },
];

export default function FeatureHighlights() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, px: 2 }}>
      <Typography
        variant='h4'
        fontWeight={700}
        textAlign='center'
        sx={{ mb: 1 }}
      >
        Everything you need, nothing you don&apos;t
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        textAlign='center'
        sx={{ mb: 6, maxWidth: 480, mx: 'auto' }}
      >
        Built for people who want their money tracked without lifting a finger.
      </Typography>

      <Grid container spacing={3} sx={{ maxWidth: 1000, mx: 'auto' }}>
        {features.map(({ title, description, icon: Icon }) => (
          <Grid size={{ xs: 12, sm: 6 }} key={title}>
            <Box
              sx={{
                height: '100%',
                p: 3,
                borderRadius: '0.75rem',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '0.5rem',
                  backgroundColor: 'action.selected',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Icon sx={{ color: 'primary.main', fontSize: 22 }} />
              </Box>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 1 }}>
                {title}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
