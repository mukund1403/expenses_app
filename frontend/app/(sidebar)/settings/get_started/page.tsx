import {
  IntroCard,
  EmailAlertsCard,
  AutoForwardingCard,
  TestingFilterCard,
  WarningCard,
} from '@/components/settings/GetStarted';

export default function SettingsGetStartedPage() {
  return (
    <>
      <IntroCard />
      <EmailAlertsCard />
      <AutoForwardingCard />
      <TestingFilterCard />
      <WarningCard />
    </>
  );
}
