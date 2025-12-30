'use client';

import {
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';

type Props = {
  forwardingEmail: string;
};

export default function ForwardingEmailCard({ forwardingEmail }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(forwardingEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      sx={{
        borderRadius: '0.5rem',
        backgroundColor: 'background.paper',
        margin: '0.5rem',
        overflow: 'hidden',
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Your Forwarding Email
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Auto-forward your bank transaction emails to this address.
        </Typography>

        <Stack direction='row' alignItems='center' spacing={1}>
          <Typography
            variant='body1'
            sx={{
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {forwardingEmail}
          </Typography>

          <Tooltip title={copied ? 'Copied!' : 'Copy'}>
            <IconButton size='small' onClick={handleCopy}>
              {copied ? <CheckIcon color='success' /> : <ContentCopyIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}
