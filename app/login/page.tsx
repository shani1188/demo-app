import { AuthForm } from "@/components/auth-form";
import { login } from "@/app/auth/actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams;
  return <AuthForm title="Welcome back" intro="Sign in to continue to your task board." action={login} mode="login" {...params} />;
}

