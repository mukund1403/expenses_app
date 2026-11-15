'use client';

import { Box, Typography } from '@mui/material';
import {
  MailRounded,
  ForwardToInboxRounded,
  AutoAwesomeRounded,
  CheckRounded,
  ArrowForwardRounded,
  LockRounded,
} from '@mui/icons-material';
import type { ReactNode } from 'react';

const PRIMARY = '#9b87f8';
const PRIMARY_SOFT = 'rgba(155, 135, 248, 0.15)';
const GREEN = '#81c784';
const GREEN_SOFT = 'rgba(76, 175, 80, 0.18)';
const SURFACE = '#26282b';
const SURFACE_BORDER = '#3a3c40';

/* ---------- Mini illustrations (styled like the hero preview card) ---------- */

function MiniCard({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 230,
        backgroundColor: SURFACE,
        border: `1px solid ${SURFACE_BORDER}`,
        borderRadius: 2,
        p: 1.5,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
      }}
    >
      {children}
    </Box>
  );
}

function EmailIllustration() {
  return (
    <MiniCard>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: PRIMARY_SOFT,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <MailRounded sx={{ fontSize: 14, color: PRIMARY }} />
        </Box>
        <Typography sx={{ fontSize: 12, fontWeight: 700, flexGrow: 1 }}>
          Card transaction alert
        </Typography>
        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
          now
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 1.25 }}>
        You spent{' '}
        <Box component='span' sx={{ color: 'text.primary', fontWeight: 700 }}>
          S$6.50
        </Box>{' '}
        at Hawker Centre
      </Typography>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.25,
          borderRadius: 5,
          backgroundColor: PRIMARY_SOFT,
          color: PRIMARY,
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        <ForwardToInboxRounded sx={{ fontSize: 12 }} />
        Forwarded to AutoEx
      </Box>
    </MiniCard>
  );
}

function CategorizeIllustration() {
  const categories = ['Food', 'Transport', 'Shopping'];
  return (
    <MiniCard>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.25,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
            Hawker Centre
          </Typography>
          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
            S$6.50 · Today
          </Typography>
        </Box>
        <AutoAwesomeRounded sx={{ fontSize: 16, color: PRIMARY }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        {categories.map((c, i) => {
          const active = i === 0;
          return (
            <Box
              key={c}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 1,
                py: 0.25,
                borderRadius: 5,
                fontSize: 10,
                fontWeight: 600,
                backgroundColor: active ? GREEN_SOFT : 'transparent',
                color: active ? GREEN : 'text.disabled',
                border: '1px solid',
                borderColor: active ? 'transparent' : SURFACE_BORDER,
              }}
            >
              {active && <CheckRounded sx={{ fontSize: 12 }} />}
              {c}
            </Box>
          );
        })}
      </Box>
    </MiniCard>
  );
}

function DashboardIllustration() {
  const bars = [35, 55, 40, 75, 50, 90, 60];
  const highlight = 5;
  return (
    <MiniCard>
      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
        This month
      </Typography>
      <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1.25 }}>
        S$842.30
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 0.75,
          height: 52,
          borderBottom: `1px solid ${SURFACE_BORDER}`,
        }}
      >
        {bars.map((h, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: `${h}%`,
              borderRadius: '3px 3px 0 0',
              backgroundColor:
                i === highlight ? PRIMARY : 'rgba(155, 135, 248, 0.3)',
            }}
          />
        ))}
      </Box>
    </MiniCard>
  );
}

/* ---------- Steps ---------- */

const STEPS: {
  title: string;
  description: string;
  tint: string;
  illustration: ReactNode;
}[] = [
  {
    title: 'Auto-Forward the email',
    description:
      "Automatically send your bank's transaction alerts to your personal AutoEx inbox. (You choose which emails to forward, so we only see what you want us to!)",
    tint: 'linear-gradient(135deg, #2d2654 0%, #221d3f 100%)',
    illustration: <EmailIllustration />,
  },
  {
    title: 'Auto categorized',
    description:
      'We read each alert, pull out the merchant and amount, and tag it with the right category.',
    tint: 'linear-gradient(135deg, #1d3a52 0%, #172c3f 100%)',
    illustration: <CategorizeIllustration />,
  },
  {
    title: 'See it instantly',
    description:
      'Every expense shows up live in your dashboard, charts and all.',
    tint: 'linear-gradient(135deg, #1a3a3a 0%, #142c2c 100%)',
    illustration: <DashboardIllustration />,
  },
];

export default function HowItWorks() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, px: 2 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', maxWidth: 560, mx: 'auto', mb: 6 }}>
        <Typography
          variant='overline'
          color='primary.main'
          fontWeight={700}
          sx={{ letterSpacing: 1.5, display: 'block', mb: 1 }}
        >
          How it works
        </Typography>
        <Typography
          variant='h4'
          fontWeight={700}
          sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 1.5 }}
        >
          From bank alert to dashboard, automatically.
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          No manual entry. Just auto-forward your bank emails and let AutoEx do
          the rest.
        </Typography>
      </Box>

      {/* Step cards */}
      <Box
        sx={{
          maxWidth: 1000,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {STEPS.map((step, i) => (
          <Box key={step.title} sx={{ position: 'relative' }}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'rgba(155, 135, 248, 0.5)',
                },
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                  '&:hover': { transform: 'none' },
                },
              }}
            >
              {/* Illustration */}
              <Box
                sx={{
                  background: step.tint,
                  height: 170,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 3,
                }}
              >
                {step.illustration}
              </Box>

              {/* Text */}
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: PRIMARY_SOFT,
                      color: PRIMARY,
                      fontWeight: 700,
                      fontSize: 14,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Typography fontWeight={600} sx={{ fontSize: '1.1rem' }}>
                    {step.title}
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary'>
                  {step.description}
                </Typography>
              </Box>
            </Box>

            {/* Arrow connector between cards (desktop only) */}
            {i < STEPS.length - 1 && (
              <Box
                aria-hidden
                sx={{
                  display: { xs: 'none', md: 'grid' },
                  placeItems: 'center',
                  position: 'absolute',
                  top: 85 - 16, // vertically centred on the illustration
                  right: -28, // centred in the 24px gap
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  zIndex: 1,
                }}
              >
                <ArrowForwardRounded sx={{ fontSize: 16, color: PRIMARY }} />
              </Box>
            )}
          </Box>
        ))}
      </Box>

      {/* Security reassurance: the core differentiator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.25,
            px: 2.5,
            py: 1.25,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'rgba(76, 175, 80, 0.06)',
            maxWidth: 560,
          }}
        >
          <LockRounded sx={{ fontSize: 18, color: GREEN, flexShrink: 0 }} />
          <Typography variant='body2' color='text.secondary'>
            We never ask for your bank login. AutoEx only sees the alerts you
            choose to forward.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
