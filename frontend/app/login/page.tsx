"use client";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // Just redirect to your backend OAuth start endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_GOLANG_URL}/auth/oauth`;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>
      <button
        style={{
          marginTop: "1rem",
          padding: "10px 16px",
          background: "#4285F4",
          color: "white",
          borderRadius: "6px",
        }}
        onClick={handleGoogleLogin}
      >
        Sign in with Google
      </button>
    </div>
  );
}
