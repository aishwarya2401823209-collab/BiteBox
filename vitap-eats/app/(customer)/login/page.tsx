"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: "var(--color-surface, #fdfbf7)" }}>
      <div 
        className="w-full max-w-md p-8 border"
        style={{ 
          background: "var(--color-surface-container-lowest, #ffffff)",
          borderColor: "#1d1b16"
        }}
      >
        <div className="text-center mb-8">
          <h1 
            className="text-2xl font-extrabold mb-2" 
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-on-surface, #1d1b16)" }}
          >
            Welcome Back
          </h1>
          <p className="text-xs" style={{ color: "var(--color-on-surface-variant, #6b6355)" }}>
            Login to your account to order delicious meals.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 flex items-center gap-3 text-xs bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--color-on-surface)" }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 text-xs border focus:outline-none focus:ring-1"
              style={{ 
                borderColor: "var(--color-border, #e6e1d6)",
                background: "var(--color-surface-container-lowest, #ffffff)",
                color: "var(--color-on-surface)"
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--color-on-surface)" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-xs border focus:outline-none focus:ring-1"
              style={{ 
                borderColor: "var(--color-border, #e6e1d6)",
                background: "var(--color-surface-container-lowest, #ffffff)",
                color: "var(--color-on-surface)"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2"
            style={{ 
              background: "#3d0c02", 
              color: "#ffffff",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
          Don&apos;t have an account?{" "}
          <Link 
            href="/signup" 
            className="font-bold underline transition-all hover:opacity-80"
            style={{ color: "#3d0c02" }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}