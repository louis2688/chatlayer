import AuthForm from "@/components/dash/AuthForm";

export const metadata = { title: "Log in - ChatLayer" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0a0f0d] px-6 text-neutral-100">
      <AuthForm mode="login" showGoogle={!!process.env.GOOGLE_CLIENT_ID} />
    </main>
  );
}