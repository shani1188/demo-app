import { AuthForm } from "@/components/auth-form";
import { signup } from "@/app/auth/actions";

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <AuthForm title="Create your account" intro="Use a real email if email confirmation is enabled." action={signup} mode="signup" {...await searchParams} />;
}

