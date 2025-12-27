'use client';

import { Card, CardContent, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';

type Props = {
  activationLink: string;
};

export default function ActivationLinkCard({ activationLink }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Activation Link
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use this link to activate auto-forwarding in Gmail.
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {activationLink}
          </Typography>

          <Tooltip title={copied ? 'Copied!' : 'Copy'}>
            <IconButton size="small" onClick={handleCopy}>
              {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}
