import React from 'react';
import StepCard from '@/components/settings/GetStarted/StepCard';
import content from '@/contents/get_started.json';

export function AutoForwardingCard() {
  return <StepCard content={content.autoForwarding} />;
}
