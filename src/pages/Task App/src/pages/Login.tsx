import React from 'react';
import { designTokens } from '../designTokens';

const Login: React.FC = () => {
  const handleGoogleSignIn = () => {
    alert('Trigger Google sign-in (placeholder)');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-[28px] border border-slate-200 shadow-lg p-8 space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
          <h1 className="text-3xl font-semibold text-slate-900">Sign in to Access WorkHub</h1>
          <p className="text-sm text-slate-500">
            Continue where you left off. Use your corporate Google account to access analytics, work items, and notes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 transition"
        >
          <span className="h-5 w-5">
            <svg viewBox="0 0 24 24" className="h-full w-full" fill="none">
              <path d="M23.5 12.206c0-.694-.062-1.206-.192-1.734H12v3.27h6.49c-.28 1.41-1.164 3.258-3.52 3.258-2.12 0-3.847-1.754-3.847-3.92s1.727-3.92 3.847-3.92c1.208 0 2.014.52 2.478.97l1.69-1.63C18.53 5.59 16.525 4.5 14.211 4.5 9.75 4.5 6 8.236 6 12.5s3.75 8 8.211 8c4.737 0 7.867-3.33 7.783-8.294z" fill="#4285F4" />
              <path d="M5.77 7.75l1.55 1.14C7.802 8.25 9.6 6.65 12 6.65c1.52 0 2.85.63 3.76 1.56l1.57-1.56C16.157 4.92 14.18 4 12 4c-2.77 0-5.23 1.5-6.23 3.75z" fill="#34A853" />
              <path d="M12 20c-2.78 0-5.134-1.51-6.35-3.75l-1.56 1.24C5.53 20.03 8.44 21.5 12 21.5c2.302 0 4.434-.82 6.05-2.17l-1.62-1.73C15.89 18.36 14.5 19 12 19z" fill="#FBBC05" />
              <path d="M18.76 15.96c-1.16 1.09-2.59 1.74-4.3 1.74-2.54 0-4.69-1.73-5.34-4.06l-1.6 1.24C8.8 17.45 10.99 19.5 14 19.5c2.63 0 4.86-1.56 5.74-3.79-.17-.07-.33-.15-.48-.23z" fill="#EA4335" />
            </svg>
          </span>
          Sign in with Google
        </button>
        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
          New to WorkHub? Ask your admin for access.
        </div>
      </div>
    </div>
  );
};

export default Login;
