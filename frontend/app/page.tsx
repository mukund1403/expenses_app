'use client';

import { Typography, Box, Button, Link as MuiLink } from '@mui/material';
import { KeyboardArrowDownRounded } from '@mui/icons-material';
import { useEffect, useRef } from 'react';
import HowItWorks from '@/components/landing/HowItWorks';
import FeatureHighlights from '@/components/landing/FeatureHighlights';
import SplitwiseCallout from '@/components/landing/SplittingAppCallout';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const words = ['Automate', 'Track', 'Simplify'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const el = textRef.current;
    if (!el) return;

    const tick = () => {
      const currentWord = words[wordIndex];

      if (!isDeleting && charIndex < currentWord.length) {
        charIndex++;
      } else if (isDeleting && charIndex > 0) {
        charIndex--;
      } else {
        isDeleting = !isDeleting;
        if (!isDeleting) {
          wordIndex = (wordIndex + 1) % words.length;
        }
      }

      el.textContent = currentWord.slice(0, charIndex);

      const delay =
        !isDeleting && charIndex === currentWord.length
          ? 1200
          : isDeleting
            ? 60
            : 120;

      setTimeout(tick, delay);
    };

    tick();
  }, []);

  return (
    <Box>
      {/* Hero section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 2,
          overflow: 'hidden',
        }}
      >
        {/* Background GIF */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/background.gif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            opacity: 0.25,
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

        {/* Centered content */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            zIndex: 2,
            position: 'relative',
          }}
        >
          <Typography
            variant='h3'
            fontWeight={700}
            color='primary.main'
            gutterBottom
          >
            AutoEx
          </Typography>

          <Typography variant='h5' fontFamily='monospace'>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span ref={textRef} />
            </span>
            | your expenses
          </Typography>

          <Button
            component={MuiLink}
            href='/home'
            variant='contained'
            size='large'
            sx={{ mt: 4, px: 5 }}
          >
            Get Started
          </Button>
        </Box>

        {/* Scroll indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 48,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
              '50%': { transform: 'translateX(-50%) translateY(8px)' },
            },
          }}
        >
          <Typography variant='caption' color='text.secondary'>
            Scroll to learn more
          </Typography>
          <KeyboardArrowDownRounded sx={{ color: 'text.secondary' }} />
        </Box>
      </Box>

      {/* Content sections — alternating backgrounds with dividers */}
      <Box>
        <Box sx={{ backgroundColor: 'background.default' }}>
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
