import AuthForm from "@/components/dash/AuthForm";

// Rendered per request so the Google button reflects the runtime env
// (GOOGLE_CLIENT_ID) instead of being frozen at build time.
export const dynamic = "force-dynamic";

export const metadata = { title: "Sign up - ChatLayer" };

export default function SignupPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0a0f0d] px-6 text-neutral-100">
      <AuthForm mode="signup" showGoogle={!!process.env.GOOGLE_CLIENT_ID} />
    </main>
  );
}