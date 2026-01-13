import Alert from '@mui/material/Alert';
import AuthCard from '@/components/auth/AuthCard';

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const code = Array.isArray(params.code) ? params.code[0] : params.code;

  if (!code) {
    return <Alert severity='error'>Missing Authorization Code.</Alert>;
  }

  return <AuthCard code={code} />;
}
