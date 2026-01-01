'use client';

import { Typography, Box, Button, Link } from '@mui/material';
import { useEffect, useRef } from 'react';

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
      el.textContent = currentWord.slice(0, charIndex);

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 2,
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
          opacity: 0.25, // dim it
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
      </Box>

      {/* Bottom button */}
      <Button
        component={Link}
        href='/home'
        variant='contained'
        size='large'
        sx={{ mb: 4, px: 5 }}
      >
        Get Started
      </Button>
    </Box>
  );
}
