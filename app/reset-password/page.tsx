import { AuthForm } from "@/components/auth-form";
import { updatePassword } from "@/app/auth/actions";

export default async function Reset({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <AuthForm title="Choose a new password" intro="Your recovery link must still be valid." action={updatePassword} mode="reset" {...await searchParams} />;
}

