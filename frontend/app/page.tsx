'use client';

import { Typography, Box, Button, Stack } from '@mui/material';
import {
  KeyboardArrowDownRounded,
  CheckCircleRounded,
  BoltRounded,
  CallSplitRounded,
} from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import { useEffect, useState, useSyncExternalStore } from 'react';
import HowItWorks from '@/components/landing/HowItWorks';
import FeatureHighlights from '@/components/landing/FeatureHighlights';
import SplitwiseCallout from '@/components/landing/SplittingAppCallout';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

/* ---------- Hero copy: edit here ---------- */

const HEADLINE = 'Expenses that track themselves.';
const SUBHEADLINE =
  'AutoEx adds your spending to your tracker automatically, without ever asking for your bank login. Splitting bills on Splitwise? Import your share in seconds.';
// Only keep claims that are true for your app.
const TRUST_POINTS = [
  'No bank login required',
  'Free to use',
  'Splitwise import built in',
];

/* ---------- Product preview (illustrative data) ---------- */

type PreviewSource = 'auto' | 'splitwise';

const PREVIEW_ROWS: {
  name: string;
  category: string;
  amount: string;
  source: PreviewSource;
}[] = [
  { name: 'Hawker lunch', category: 'Food', amount: 'S$6.50', source: 'auto' },
  {
    name: 'Taxi ride',
    category: 'Transport',
    amount: 'S$14.20',
    source: 'auto',
  },
  {
    name: 'Dinner · your share',
    category: 'Food',
    amount: 'S$26.26',
    source: 'splitwise',
  },
  {
    name: 'Supermarket',
    category: 'Groceries',
    amount: 'S$38.65',
    source: 'auto',
  },
];

const reducedMotionSx = {
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    opacity: 1,
  },
};

function SourceTag({ source }: { source: PreviewSource }) {
  const isAuto = source === 'auto';
  const Icon = isAuto ? BoltRounded : CallSplitRounded;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
        color: isAuto ? 'primary.main' : 'success.main',
        fontSize: '0.7rem',
        fontWeight: 600,
      }}
    >
      <Icon sx={{ fontSize: '0.85rem' }} />
      {isAuto ? 'Auto-added' : 'From Splitwise'}
    </Box>
  );
}

// Feed timing (seconds). Rows reveal, hold, fade out, then the loop restarts.
const ROW_START_DELAY = 0.5;
const ROW_STAGGER = 0.6;
const ROW_ANIM = 0.5;
const REVEAL_DONE_MS =
  (ROW_START_DELAY + (PREVIEW_ROWS.length - 1) * ROW_STAGGER + ROW_ANIM) * 1000;
const LOOP_MS = 10000; // full cycle length
const FADE_OUT_MS = 400;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Reads the user's reduced-motion setting and re-renders if it changes.
 * Returns false during server rendering (no window), avoiding hydration issues.
 */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(REDUCED_MOTION_QUERY);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * A mock transaction feed where rows appear one by one, then loops,
 * showing "expenses arrive on their own" without needing a screenshot.
 */
function ProductPreview() {
  const reducedMotion = usePrefersReducedMotion();
  const [cycle, setCycle] = useState(0);
  const [syncing, setSyncing] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Reduced motion: show the feed once, no looping.
    if (reducedMotion) return;

    // All state updates happen inside timer callbacks, never synchronously
    // in the effect body.
    const synced = setTimeout(() => setSyncing(false), REVEAL_DONE_MS);
    const fade = setTimeout(() => setLeaving(true), LOOP_MS - FADE_OUT_MS);
    const restart = setTimeout(() => {
      setLeaving(false);
      setSyncing(true);
      setCycle((c) => c + 1);
    }, LOOP_MS);

    return () => {
      clearTimeout(synced);
      clearTimeout(fade);
      clearTimeout(restart);
    };
  }, [cycle, reducedMotion]);

  const showSyncing = syncing && !reducedMotion;
  const hidden = leaving && !reducedMotion;

  return (
    <Box
      aria-hidden
      sx={{
        width: '100%',
        maxWidth: 380,
        justifySelf: 'center',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: 2.5,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
        textAlign: 'left',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='subtitle2' fontWeight={700}>
          Today
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'success.main',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.35 },
              },
              ...reducedMotionSx,
            }}
          />
          <Typography variant='caption' color='text.secondary'>
            {showSyncing ? 'Syncing…' : 'Synced just now'}
          </Typography>
        </Box>
      </Box>

      {/* key={cycle} remounts the rows so their entry animations replay */}
      <Stack
        key={cycle}
        spacing={1.25}
        sx={{
          opacity: hidden ? 0 : 1,
          transition: `opacity ${FADE_OUT_MS}ms ease-in`,
        }}
      >
        {PREVIEW_ROWS.map((row, i) => (
          <Box
            key={row.name}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid',
              borderColor: 'divider',
              opacity: 0,
              animation: `rowIn ${ROW_ANIM}s ease-out ${ROW_START_DELAY + i * ROW_STAGGER}s forwards`,
              '@keyframes rowIn': {
                from: { opacity: 0, transform: 'translateY(8px)' },
                to: { opacity: 1, transform: 'none' },
              },
              ...reducedMotionSx,
            }}
          >
            <Box>
              <Typography variant='body2' fontWeight={600}>
                {row.name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {row.category}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant='body2' fontWeight={600}>
                {row.amount}
              </Typography>
              <SourceTag source={row.source} />
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

/* ---------- Page ---------- */

export default function LandingPage() {
  // TODO: paste the body of handleGoogleLogin from your existing sign-in component here
  // (or import it from a shared module if it already lives in one).
  const handleGoogleLogin = async () => {};

  const scrollToHowItWorks = () => {
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box>
      {/* Hero section */}
      <Box
        sx={{
          position: 'relative',
          // On desktop the hero is a bit shorter than the screen so the next
          // section peeks in. On mobile it's content-height: the preview card
          // naturally runs past the fold, which signals "there's more".
          minHeight: { md: '88vh' },
          '@supports (min-height: 100svh)': { minHeight: { md: '88svh' } },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          pt: { xs: 10, md: 6 },
          pb: { xs: 8, md: 10 },
          overflow: 'hidden',
        }}
      >
        {/* Ambient gradient: a soft glow toward the preview card (right on
            desktop, lower-middle on mobile) plus a faint one top-left */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: {
              xs: `radial-gradient(ellipse 90% 45% at 50% 80%, rgba(155, 135, 248, 0.16), transparent 70%),
                   radial-gradient(ellipse 70% 35% at 20% 10%, rgba(155, 135, 248, 0.07), transparent 70%)`,
              md: `radial-gradient(ellipse 55% 60% at 78% 50%, rgba(155, 135, 248, 0.16), transparent 70%),
                   radial-gradient(ellipse 45% 45% at 12% 15%, rgba(155, 135, 248, 0.07), transparent 70%)`,
            },
          }}
        />

        {/* Fade to solid background at the bottom of hero */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: 'linear-gradient(to bottom, transparent, #191a1c)',
            zIndex: 1,
          }}
        />

        {/* Two-column on desktop, stacked on mobile */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: 1100,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            gap: { xs: 6, md: 8 },
            alignItems: 'center',
          }}
        >
          {/* Value proposition */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Typography
              variant='h6'
              fontWeight={700}
              color='primary.main'
              sx={{ mb: 2 }}
            >
              AutoEx
            </Typography>

            <Typography
              component='h1'
              variant='h3'
              fontWeight={800}
              sx={{
                fontSize: { xs: '2.25rem', md: '3.25rem' },
                lineHeight: 1.1,
                mb: 2,
              }}
            >
              {HEADLINE}
            </Typography>

            <Typography
              variant='h6'
              color='text.secondary'
              fontWeight={400}
              sx={{ maxWidth: 520, fontSize: { xs: '1rem', md: '1.15rem' } }}
            >
              {SUBHEADLINE}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems='center'
              sx={{ mt: 4 }}
            >
              <Button
                variant='contained'
                startIcon={<GoogleIcon />}
                sx={{
                  backgroundColor: '#4285F4',
                  color: '#fff',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: '#357ae8',
                  },
                }}
                onClick={handleGoogleLogin}
              >
                Sign in with Google
              </Button>

              <Button
                variant='text'
                color='inherit'
                endIcon={<KeyboardArrowDownRounded />}
                onClick={scrollToHowItWorks}
                sx={{
                  px: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  color: 'text.secondary',
                }}
              >
                See how it works
              </Button>
            </Stack>

            <Stack
              direction='row'
              flexWrap='wrap'
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{ mt: 3, columnGap: 2.5, rowGap: 1 }}
            >
              {TRUST_POINTS.map((point) => (
                <Box
                  key={point}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                >
                  <CheckCircleRounded
                    sx={{ fontSize: '1rem', color: 'success.main' }}
                  />
                  <Typography variant='caption' color='text.secondary'>
                    {point}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Product preview, with a glow behind it */}
          <Box
            sx={{
              position: 'relative',
              isolation: 'isolate',
              justifySelf: 'center',
              width: '100%',
              maxWidth: 380,
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: '-12%',
                background:
                  'radial-gradient(closest-side, rgba(155, 135, 248, 0.35), transparent)',
                filter: 'blur(32px)',
                zIndex: -1,
              },
            }}
          >
            <ProductPreview />
          </Box>
        </Box>

        {/* Subtle scroll hint, desktop only (mobile relies on the card peeking past the fold) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: { xs: 'none', md: 'flex' },
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
              '50%': { transform: 'translateX(-50%) translateY(6px)' },
            },
            ...reducedMotionSx,
          }}
        >
          <KeyboardArrowDownRounded sx={{ color: 'text.secondary' }} />
        </Box>
      </Box>

      {/* Content sections — alternating backgrounds with dividers */}
      <Box>
        <Box id='how-it-works' sx={{ backgroundColor: 'background.default' }}>
          <HowItWorks />
        </Box>

        <Box
          sx={{
            backgroundColor: 'rgba(155, 135, 248, 0.04)',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <FeatureHighlights />
        </Box>

        <Box
          sx={{
            backgroundColor: 'background.default',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <SplitwiseCallout />
        </Box>

        <Box
          sx={{
            backgroundColor: 'rgba(155, 135, 248, 0.04)',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <FinalCTA />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
