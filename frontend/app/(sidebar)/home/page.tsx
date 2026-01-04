import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Alert from '@mui/material/Alert';

type UserDetailsResponse = {
  name: string;
  registered_email: string;
  forwarding_email: string;
};

export default async function HomePage() {
  // Placeholder logic to ping backend route to find if user is authenticated
  // TODO: Replace with `/home` with relevant features
  const cookieStore = await cookies();

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

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login Successful 🎉</h1>
      <p>Welcome, {userDetails.name}</p>
      <p>Your session is now active via a secure HttpOnly cookie.</p>
      <p>You can now navigate to protected pages.</p>
    </div>
  );
}
