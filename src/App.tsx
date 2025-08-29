import React, { useState, useEffect } from "react";
import "./App.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import router from "./router/Router.js";
import { jwtDecode } from "jwt-decode";
import { RouterProvider } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import axios from "axios";
import Data_security_02 from "./assets/Data_security_02.jpg";

// ✅ Use your in-house toast system
import { useToast } from "./toast/ToastProvider"; // adjust path if needed

export default function App() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();

  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

  useEffect(() => {
    const img = new Image();
    img.src = Data_security_02;
    img.onload = () => {
      setIsImageLoaded(true);
      // Soft, non-blocking signal
      // toast.info("Visuals are good to go.", { durationMs: 1500, position: "bottom-center" });
    };
    img.onerror = () => {
      setIsImageLoaded(true);
      console.error("Failed to load background image.");
      // toast.warning("Background image didn’t load. The app is still fully functional.", {
      //   durationMs: 4000,
      //   position: "bottom-center",
      // });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSuccess = async (credentialResponse: any) => {
    // Anchor a sticky “loading” toast; we’ll clear it on outcome
    const loadingId = toast.info("Authenticating with Google…", {
      durationMs: 0, // sticky
      position: "bottom-center",
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
          position: "bottom-center",
          title: "Sign-in issue",
        });
        return;
      }

      // Nudge the user we’re moving forward
      toast.remove(loadingId);
      const validatingId = toast.info("Validating your access…", {
        durationMs: 0,
        position: "bottom-center",
        dismissible: true,
      });

      const response = await axios.get(`/api/employee/checkEmail?email=${userEmail}`);

      if (response.status === 200) {
        const details = response.data?.employee_details;
        setUser({
          ...decoded,
          role: details?.role,
          employee_id: details?.employee_id,
          userId: details?._id,
        });

        toast.remove(validatingId);
        toast.success(`Welcome back${decoded?.name ? `, ${decoded.name}` : ""}! You’re in.`, {
          title: "Signed in",
          durationMs: 2500,
          position: "bottom-center",
        });
      } else {
        toast.remove(validatingId);
        toast.error("We couldn’t confirm your access right now. Please try again shortly.", {
          title: "Access not confirmed",
          durationMs: 5000,
          position: "bottom-center",
        });
      }
    } catch (error: any) {
      console.error("Error decoding JWT or backend validation failed:", error);
      toast.clear?.(); // optional: clear any lingering loaders if your API supports it

      const isNetwork =
        error?.code === "ERR_NETWORK" || error?.message?.toLowerCase()?.includes("network");
      const msg = isNetwork
        ? "Network hiccup while validating your access. Check your connection and retry."
        : "Please contact admin";

      toast.error(msg, {
        title: "Authentication failed",
        durationMs: 5000,
        position: "bottom-center",
      });
    }
  };

  const handleError = () => {
    console.error("Login Failed");
    toast.error("Google sign-in was canceled or failed. Please try again.", {
      title: "Sign-in failed",
      durationMs: 4000,
      position: "bottom-center",
    });
  };

  const SkeletonLoader = () => (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-gray-200 animate-pulse">
      <div className="bg-gray-300 p-8 rounded-xl shadow-lg w-full max-w-md h-60 flex flex-col justify-center items-center">
        <div className="h-8 bg-gray-400 rounded w-3/4 mb-6"></div>
        <div className="h-12 bg-gray-400 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {user ? (
        <RouterProvider router={router} />
      ) : (
        <>
          {!isImageLoaded && <SkeletonLoader />}

          <div
            className={`min-h-screen w-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
              isImageLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}
          >
            <div className="bg-opacity-70 backdrop-filter backdrop-blur-[5px] p-8 rounded-xl shadow-lg w/full max-w-md text-center">
              <h1 className="text-3xl font-semibold mb-6 text-gray-800">Sign In with Google</h1>
              <div className="flex justify-center">
                <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
              </div>
            </div>
          </div>
        </>
      )}
    </GoogleOAuthProvider>
  );
}
