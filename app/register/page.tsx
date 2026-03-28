"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please sign in manually.");
        setLoading(false);
      } else {
        router.push("/lists");
        router.refresh();
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl font-bold bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
            LEXICA
          </Link>
          <h1 className="font-serif text-2xl font-bold text-text-primary mt-4">Create account</h1>
          <p className="text-sm text-text-muted mt-1">Save your words across devices</p>
        </div>

        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-text-secondary mb-1.5">Name (optional)</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--glow)] transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-text-secondary mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--glow)] transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-text-secondary mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--glow)] transition-colors"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-text-secondary mb-1.5">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full h-11 px-4 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--glow)] transition-colors"
              placeholder="Repeat your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
