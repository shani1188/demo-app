import { AuthForm } from "@/components/auth-form";
import { requestPasswordReset } from "@/app/auth/actions";

export default async function Forgot({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  return <AuthForm title="Reset your password" intro="We’ll send recovery instructions without revealing whether the account exists." action={requestPasswordReset} mode="forgot" {...await searchParams} />;
}

