'use client';

import { Box, Typography } from '@mui/material';

export default function HowItWorks() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, px: 2 }}>
      <Typography
        variant='h4'
        fontWeight={700}
        textAlign='center'
        sx={{ mb: 1 }}
      >
        How it works
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        textAlign='center'
        sx={{ mb: 0.3, maxWidth: 480, mx: 'auto' }}
      >
        No manual entry. Just forward your bank emails and let AutoEx do the
        rest.
      </Typography>

      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <svg width='100%' viewBox='0 0 680 240' role='img'>
          <title>Three illustrated steps showing how AutoEx works</title>
          <desc>
            Step one: forward your bank email. Step two: automatic
            categorization. Step three: view in dashboard.
          </desc>
          <defs>
            <marker
              id='arrow'
              viewBox='0 0 10 10'
              refX='8'
              refY='5'
              markerWidth='6'
              markerHeight='6'
              orient='auto-start-reverse'
            >
              <path
                d='M2 1L8 5L2 9'
                fill='none'
                stroke='#9b87f8'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </marker>
          </defs>

          {/* Step 1 — Email */}
          <g transform='translate(60,40)'>
            <rect
              x='0'
              y='20'
              width='140'
              height='100'
              rx='12'
              fill='#2d2654'
            />
            <rect
              x='20'
              y='50'
              width='100'
              height='64'
              rx='6'
              fill='#26282b'
              stroke='#3a3c40'
              strokeWidth='0.5'
            />
            <path
              d='M20 56 L70 86 L120 56'
              fill='none'
              stroke='#9b87f8'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <circle cx='100' cy='56' r='10' fill='#9b87f8' opacity='0.25' />
          </g>

          {/* Step 2 — Categorize */}
          <g transform='translate(270,40)'>
            <rect
              x='0'
              y='20'
              width='140'
              height='100'
              rx='12'
              fill='#1d3a52'
            />
            <circle
              cx='70'
              cy='65'
              r='28'
              fill='#26282b'
              stroke='#3a3c40'
              strokeWidth='0.5'
            />
            <path
              d='M58 65 L66 73 L84 55'
              fill='none'
              stroke='#4caf50'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <rect x='40' y='98' width='60' height='10' rx='5' fill='#26282b' />
          </g>

          {/* Step 3 — Dashboard */}
          <g transform='translate(480,40)'>
            <rect
              x='0'
              y='20'
              width='140'
              height='100'
              rx='12'
              fill='#1a3a3a'
            />
            <rect
              x='20'
              y='40'
              width='100'
              height='62'
              rx='6'
              fill='#26282b'
              stroke='#3a3c40'
              strokeWidth='0.5'
            />
            <rect x='30' y='78' width='12' height='16' fill='#9b87f8' />
            <rect x='48' y='68' width='12' height='26' fill='#9b87f8' />
            <rect x='66' y='58' width='12' height='36' fill='#9b87f8' />
            <rect x='84' y='72' width='12' height='22' fill='#9b87f8' />
            <line
              x1='30'
              y1='94'
              x2='100'
              y2='94'
              stroke='#3a3c40'
              strokeWidth='0.5'
            />
          </g>

          <line
            x1='205'
            y1='90'
            x2='265'
            y2='90'
            stroke='#3a3c40'
            strokeWidth='1.5'
            markerEnd='url(#arrow)'
          />
          <line
            x1='415'
            y1='90'
            x2='475'
            y2='90'
            stroke='#3a3c40'
            strokeWidth='1.5'
            markerEnd='url(#arrow)'
          />

          <text
            x='130'
            y='180'
            textAnchor='middle'
            fill='#fafafa'
            fontSize='14'
            fontWeight='500'
          >
            Forward the email
          </text>
          <text
            x='130'
            y='200'
            textAnchor='middle'
            fill='#9a9a9a'
            fontSize='12'
          >
            Your bank alert lands in
          </text>
          <text
            x='130'
            y='216'
            textAnchor='middle'
            fill='#9a9a9a'
            fontSize='12'
          >
            your AutoEx inbox
          </text>

          <text
            x='340'
            y='180'
            textAnchor='middle'
            fill='#fafafa'
            fontSize='14'
            fontWeight='500'
          >
            Auto categorized
          </text>
          <text
            x='340'
            y='200'
            textAnchor='middle'
            fill='#9a9a9a'
            fontSize='12'
          >
            We read, parse, and
          </text>
          <text
            x='340'
            y='216'
            textAnchor='middle'
            fill='#9a9a9a'
            fontSize='12'
          >
            tag it for you
          </text>

          <text
            x='550'
            y='180'
            textAnchor='middle'
            fill='#fafafa'
            fontSize='14'
            fontWeight='500'
          >
            See it instantly
          </text>
          <text
            x='550'
            y='200'
            textAnchor='middle'
            fill='#9a9a9a'
            fontSize='12'
          >
            Live in your dashboard:
          </text>
          <text
            x='550'
            y='216'
            textAnchor='middle'
            fill='#9a9a9a'
            fontSize='12'
          >
            charts and all
          </text>
        </svg>
      </Box>
    </Box>
  );
}
