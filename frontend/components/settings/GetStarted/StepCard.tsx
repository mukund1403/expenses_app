'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  Step,
  StepButton,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import Alert from '@mui/material/Alert';

export interface StepLink {
  label: string;
  url: string;
}

export interface StepImage {
  alt: string;
  src: string;
}

export interface Step {
  heading: string;
  text: string[];
  link?: StepLink;
  notes?: string[];
  image?: StepImage;
  captions?: string[];
}

export interface StepContentType {
  heading: string;
  steps: Step[];
}

export default function StepCard({ content }: { content: StepContentType }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeStep, setActiveStep] = useState(0);

  const renderStepContent = (stepIndex: number) => {
    const step = content.steps[stepIndex];

    return (
      <>
        {step.text.map((text, i) => (
          <Typography key={i} variant='body1' sx={{ my: 1 }}>
            {text}
          </Typography>
        ))}
        {step.link && (
          <Link
            href={step.link.url}
            target='_blank'
            rel='noopener noreferrer'
            sx={{ my: 1, display: 'inline-block' }}
          >
            {step.link.label}
          </Link>
        )}
        {step.notes && (
          <Alert severity='info'>
            {step.notes.map((note, i) => (
              <Typography key={i} variant='body1' fontSize='small'>
                {note}
              </Typography>
            ))}
          </Alert>
        )}
        {step.image?.src && (
          <Box
            component='img'
            src={step.image.src}
            alt={step.image.alt ?? ''}
            sx={{
              width: '100%',
              borderWidth: '1px',
              borderRadius: '4px', // Same as Alert
              borderColor: 'text.primary',
              display: 'block',
              ...(step.captions ? { mt: 1 } : { my: 1 }),
            }}
          />
        )}
        {step.captions?.map((caption, i) => (
          <Typography key={i} variant='body1' fontSize='small' sx={{ mb: 1 }}>
            {caption}
          </Typography>
        ))}
        <Stack
          direction='row'
          spacing={1}
          justifyContent={isMobile ? 'flex-start' : 'space-between'}
          sx={{ mt: 1 }}
        >
          <Button
            onClick={() => setActiveStep((s) => s - 1)}
            disabled={stepIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setActiveStep((s) => s + 1)}
            disabled={stepIndex === content.steps.length - 1}
          >
            Next
          </Button>
        </Stack>
      </>
    );
  };

  return (
    <Card
      sx={{
        borderRadius: '0.5rem',
        backgroundColor: 'background.paper',
        margin: '0.5rem',
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant='h4' sx={{ textAlign: 'center', mb: 1 }}>
          {content.heading}
        </Typography>
        <Stepper
          activeStep={activeStep}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          alternativeLabel={!isMobile}
          nonLinear
        >
          {content.steps.map((step, index) => (
            <Step key={index}>
              <StepButton onClick={() => setActiveStep(index)}>
                <StepLabel>{step.heading}</StepLabel>
              </StepButton>
              {isMobile && (
                <StepContent>{renderStepContent(index)}</StepContent>
              )}
            </Step>
          ))}
        </Stepper>
        {!isMobile && renderStepContent(activeStep)}
      </CardContent>
    </Card>
  );
}
