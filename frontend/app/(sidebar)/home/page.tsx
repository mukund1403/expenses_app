"use client";

export default function AuthSuccess() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login Successful 🎉</h1>
      <p>Your session is now active via a secure HttpOnly cookie.</p>
      <p>You can now navigate to protected pages.</p>
    </div>
  );
}
