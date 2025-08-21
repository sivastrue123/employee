import React, { useState, useEffect } from "react";
import "./App.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import router from "./router/Router.js";
import { jwtDecode } from "jwt-decode";
import { RouterProvider } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import axios from "axios";
import Data_security_02 from "./assets/Data_security_02.jpg"; // Make sure this path is correct

export default function App() {
  const { user, setUser, logout } = useAuth();

  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const img = new Image();
    img.src = Data_security_02;
    img.onload = () => {
      setIsImageLoaded(true);
    };
    img.onerror = () => {
      setIsImageLoaded(true);
      console.error("Failed to load background image.");
    };
  }, []);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      console.log("Login successful:", decoded);
      const userEmail = decoded.email;

      if (!userEmail) {
        console.error("Email not found in decoded JWT");

        console.log("Message: Email not valid");
        return;
      }

      const response = await axios.get(
        `/api/employee/checkEmail?email=${userEmail}`
      );

      if (response.status === 200) {
        console.log("Backend validation successful:", response.data);

        setUser({
          ...decoded,
          role: response.data.employee_details.role,
          employee_id: response.data.employee_details.employee_id,
          userId: response.data.employee_details._id,
        });
      }
    } catch (error) {
      console.log("Message: Access Denied");
      console.error("Error decoding JWT or backend validation failed:", error);
    }
  };

  const handleError = () => {
    console.error("Login Failed");
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
            // style={{ backgroundImage: `url(${Data_security_02})` }}
          >
            <div className=" bg-opacity-70 backdrop-filter backdrop-blur-[5px] p-8 rounded-xl shadow-lg w-full max-w-md text-center">
              <h1 className="text-3xl font-semibold mb-6 text-gray-800">
                Sign In with Google
              </h1>
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
