'use client';

import { Card, CardContent, Typography, Link, Stack } from '@mui/material';

type Props = {
  message: string;
  getStartedHref: string;
};

export default function EmptyActivationState({
  message,
  getStartedHref,
}: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Activation Link
        </Typography>

        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {message || 'You have not set up auto-forwarding yet.'}
          </Typography>

          <Typography variant="body2">
            <Link href={getStartedHref} underline="hover">
              Click here to get started
            </Link>{' '}
            to learn how to set it up.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
