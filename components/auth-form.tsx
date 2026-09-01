import Link from "next/link";

type Props = {
  title: string; intro: string; action: (data: FormData) => Promise<void>;
  mode: "login" | "signup" | "forgot" | "reset"; error?: string; success?: string;
};

export function AuthForm({ title, intro, action, mode, error, success }: Props) {
  const asksEmail = mode !== "reset";
  const asksPassword = mode !== "forgot";
  const submit = { login: "Sign in", signup: "Create account", forgot: "Send reset link", reset: "Update password" }[mode];
  return (
    <section className="auth-shell" aria-labelledby="auth-title">
      <div className="panel">
        <p className="eyebrow">Pulseboard account</p>
        <h1 id="auth-title">{title}</h1>
        <p>{intro}</p>
        {error && <div className="alert error" role="alert" data-testid="auth-error">{error}</div>}
        {success && <div className="alert success" role="status">{success}</div>}
        <form action={action} className="form-stack">
          {asksEmail && <label>Email address<input name="email" type="email" autoComplete="email" required data-testid="email" /></label>}
          {asksPassword && <label>{mode === "reset" ? "New password" : "Password"}<input name="password" type="password" minLength={10} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"} required data-testid="password" /><span className="field-hint">10–72 characters</span></label>}
          <button className="button primary" type="submit" data-testid="auth-submit">{submit}</button>
        </form>
        <p>
          {mode === "login" && <><Link className="text-link" href="/forgot-password">Forgot password?</Link><br />New here? <Link className="text-link" href="/signup">Create an account</Link></>}
          {mode === "signup" && <>Already registered? <Link className="text-link" href="/login">Sign in</Link></>}
          {(mode === "forgot" || mode === "reset") && <Link className="text-link" href="/login">Back to sign in</Link>}
        </p>
      </div>
    </section>
  );
}

