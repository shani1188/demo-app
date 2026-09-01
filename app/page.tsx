import Link from "next/link";

export default function Home() {
  return (
    <section className="hero">
      <p className="eyebrow">A deliberately testable product</p>
      <h1>Plan the work.<br />Prove it works.</h1>
      <p className="lede">Pulseboard is a compact task manager used to demonstrate production-grade pull request quality automation.</p>
      <div className="actions">
        <Link className="button primary" href="/signup" data-testid="get-started">Create account</Link>
        <Link className="button secondary" href="/login">Sign in</Link>
      </div>
    </section>
  );
}

