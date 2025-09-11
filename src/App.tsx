import "./App.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import router from "./router/Router.js";
import { jwtDecode } from "jwt-decode";
import { RouterProvider } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { api } from "./lib/axios";
// ✅ Use your in-house toast system
import { useToast } from "./toast/ToastProvider"; // adjust path if needed
import { useState } from "react";
import Logo from "./assets/ezofis-logo.png";

export default function App() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [status, setStatus] = useState<
    "idle" | "pending" | "enabled" | "error"
  >("idle");
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

  const handleSuccess = async (credentialResponse: any) => {
    // Anchor a sticky “loading” toast; we’ll clear it on outcome
    const loadingId = toast.info("Authenticating with Google…", {
      durationMs: 0, // sticky
      position: "bottom-left",
      dismissible: true,
    });

    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const userEmail = decoded?.email;

      if (!userEmail) {
        console.error("Email not found in decoded JWT");
        toast.remove(loadingId);
        toast.error("We couldn’t read your Google email. Please try again.", {
          durationMs: 5000,
          position: "bottom-left",
          title: "Sign-in issue",
        });
        return;
      }

      // Nudge the user we’re moving forward
      toast.remove(loadingId);
      const validatingId = toast.info("Validating your access…", {
        durationMs: 0,
        position: "bottom-left",
        dismissible: true,
      });

      const response = await api.get(
        `/api/employee/checkEmail?email=${userEmail}`
      );

      if (response.status === 200) {
        const details = response.data?.employee_details;
        setUser({
          ...decoded,
          role: details?.role,
          employee_id: details?.employee_id,
          userId: details?._id,
        });

        toast.remove(validatingId);
        toast.success(
          `Welcome back${decoded?.name ? `, ${decoded.name}` : ""}! You’re in.`,
          {
            title: "Signed in",
            durationMs: 2500,
            position: "bottom-left",
          }
        );
      } else {
        toast.remove(validatingId);
        toast.error(
          "We couldn’t confirm your access right now. Please try again shortly.",
          {
            title: "Access not confirmed",
            durationMs: 5000,
            position: "bottom-left",
          }
        );
      }
    } catch (error: any) {
      console.error("Error decoding JWT or backend validation failed:", error);
      toast.clear?.(); // optional: clear any lingering loaders if your API supports it

      const isNetwork =
        error?.code === "ERR_NETWORK" ||
        error?.message?.toLowerCase()?.includes("network");
      const msg = isNetwork
        ? "Network hiccup while validating your access. Check your connection and retry."
        : "Please contact admin";

      toast.error(msg, {
        title: "Authentication failed",
        durationMs: 5000,
        position: "bottom-left",
      });
    }
  };

  const handleError = () => {
    console.error("Login Failed");
    toast.error("Google sign-in was canceled or failed. Please try again.", {
      title: "Sign-in failed",
      durationMs: 4000,
      position: "bottom-left",
    });
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {user ? (
        <RouterProvider router={router} />
      ) : (
        <div className="min-h-screen w-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100">
          {/* Skip link for a11y */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-white dark:bg-neutral-900 px-4 py-2 rounded-md shadow"
          >
            Skip to content
          </a>

          {/* Top Navigation */}
          <header className="w-full border-b border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={Logo}
                  alt="ezofis"
                  className="h-9 w-auto"
                  onError={(e: any) => (e.currentTarget.style.display = "none")}
                />
                <span className="text-2xl font-semibold tracking-tight text-[#2F78FF]">
                  ezofis
                </span>
              </div>

              {/* Right rail actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-neutral-800 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F78FF]/60"
                  aria-label="Change language"
                  title="Language"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    <path d="M3.6 9h16.8" />
                    <path d="M3.6 15h16.8" />
                    <path d="M11 3.5a17 17 0 0 0 0 17" />
                    <path d="M13 3.5a17 17 0 0 1 0 17" />
                  </svg>
                  EN
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main id="main" className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-12 lg:py-20">
              {/* Brand / Narrative Panel */}
              <section className="relative overflow-hidden order-2 lg:order-1 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8 lg:p-12">
                {/* Decorative gradient */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#2F78FF]/10 blur-3xl"
                />
                <div className="max-w-xl">
                  <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">
                    EZOFIS Team Hub
                  </h1>
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-base lg:text-lg">
                    Centralized access to your day-to-day workflows — securely
                    authenticated via Google. Ship faster, collaborate better,
                    and stay aligned.
                  </p>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { k: "99.99%", v: "Uptime" },
                      { k: "SOC 2", v: "Type II" },
                      { k: "SSO", v: "Ready" },
                    ].map((item) => (
                      <div
                        key={item.k}
                        className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 px-4 py-5"
                      >
                        <div className="text-xl font-semibold">{item.k}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.v}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Operational
                    </div>
                    <div>24×7 Monitoring</div>
                    <div>Zero-trust Posture</div>
                  </div>
                </div>
              </section>

              {/* Auth Card */}
              <section className="order-1 lg:order-2 flex items-center">
                <div className="w-full">
                  <div className="mx-auto w-full max-w-md">
                    <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur px-8 py-10 shadow-xl shadow-black/5 dark:shadow-black/40">
                      {/* Avatar / Icon */}
                      <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gray-100 dark:bg-neutral-900 grid place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M2 21a8 8 0 0 1 13.292-6" />
                          <circle cx="10" cy="8" r="5" />
                          <path d="m16 19 2 2 4-4" />
                        </svg>
                      </div>

                      <h2 className="text-center text-2xl font-semibold">
                        Sign in with Google
                      </h2>
                      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Use your corporate Google account to continue.
                      </p>

                      {/* Google CTA */}
                      <div className="mt-8">
                        <div className="flex w-full justify-center">
                          <div className="flex w-full justify-center">
                            <GoogleLogin
                              onSuccess={handleSuccess}
                              onError={handleError}
                              theme="outline"
                              size="large"
                              text="continue_with"
                              shape="rectangular"
                              logo_alignment="left"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Fine print / Trust */}
                      <div className="mt-6 space-y-2 text-center text-xs text-gray-500 dark:text-gray-400">
                        <p>
                          By continuing, you acknowledge our{" "}
                          <a
                            href="#"
                            className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Acceptable Use
                          </a>{" "}
                          &{" "}
                          <a
                            href="#"
                            className="underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Privacy Policy
                          </a>
                          .
                        </p>
                        <p aria-live="polite" className="sr-only">
                          Notifications appear at the bottom center.
                        </p>
                      </div>
                    </div>

                    {/* Footer microcopy */}
                    <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                      Need access? Contact your administrator.
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/70 backdrop-blur">
            <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>
                © {new Date().getFullYear()} ezofis. All rights reserved.
              </span>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Security
                </a>
                <a
                  href="#"
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Status
                </a>
                <a
                  href="#"
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Help
                </a>
              </div>
            </div>
          </footer>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}
