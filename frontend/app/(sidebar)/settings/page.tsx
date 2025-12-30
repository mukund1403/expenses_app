import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Alert from '@mui/material/Alert';

import UserDetailsCard from '@/components/settings/UserDetailsCard';
import ForwardingEmailCard from '@/components/settings/ForwardingEmailCard';
import ActivationLinkCard from '@/components/settings/ActivationLinkCard';
import EmptyActivationState from '@/components/settings/EmptyActivationState';

type UserDetailsResponse = {
  name: string;
  registered_email: string;
  forwarding_email: string;
};

type ActivationLinkResponse = {
  activation_link: string;
};

export default async function SettingsPage() {
  const cookieStore = await cookies();

  /* -----------------------------
     1. Fetch user details (required)
  ------------------------------ */
  let userDetails: UserDetailsResponse;

  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_GOLANG_URL}/settings/user_details`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
      method: 'GET',
      cache: 'no-store',
      redirect: 'manual',
    },
  );

  // Handle auth redirects
  if (userRes.status >= 300 && userRes.status < 400) {
    const redirectUrl = userRes.headers.get('Location');
    if (redirectUrl) {
      redirect(redirectUrl);
    }
  }

  try {
    if (!userRes.ok) {
      throw new Error(`Failed to fetch user details: ${userRes.status}`);
    }

    userDetails = await userRes.json();
  } catch (e) {
    return (
      <Alert severity='error'>
        Failed to retrieve user details. Please try again later.
      </Alert>
    );
  }

  /* ----------------------------------
     2. Fetch activation link (optional)
  ----------------------------------- */
  let activationLink: string | null = null;
  let activationError: string | null = null;

  try {
    const activationRes = await fetch(
      `${process.env.NEXT_PUBLIC_GOLANG_URL}/settings/activation_link`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        method: 'GET',
        cache: 'no-store',
      },
    );

    if (activationRes.ok) {
      const data: ActivationLinkResponse = await activationRes.json();
      activationLink = data.activation_link;
    } else if (activationRes.status === 400) {
      const data = await activationRes.json();
      activationError = data.error;
    } else {
      activationError = 'Unable to retrieve activation link.';
    }
  } catch (e) {
    activationError = 'Unable to retrieve activation link.';
  }

  /* -----------------------------
     3. Render page
  ------------------------------ */
  return (
    <>
      <UserDetailsCard
        name={userDetails.name}
        registeredEmail={userDetails.registered_email}
      />

      <ForwardingEmailCard forwardingEmail={userDetails.forwarding_email} />

      {activationLink ? (
        <ActivationLinkCard activationLink={activationLink} />
      ) : (
        <EmptyActivationState
          message={activationError ?? ''}
          getStartedHref='/settings/get_started'
        />
      )}
    </>
  );
}
