import React, { useState } from "react";
import "./App.css";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import router from "./router/Router.js";
import { jwtDecode } from "jwt-decode";
import { RouterProvider } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import axios from "axios";
import Data_security_02 from "./assets/Data_security_02.jpg";

export default function App() {
  const { user, setUser, logout } = useAuth();

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      console.log("Login successful:", decoded);
      const userEmail = decoded.email;
      if (!userEmail) {
        console.error("Email not found in decoded JWT");
        alert("Email not valid");
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
      alert("Access Denied");
      console.error("Error decoding JWT:", error);
    }
  };

  const handleError = () => {
    console.error("Login Failed");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {user ? (
        <RouterProvider router={router} />
      ) : (
        <div
          className="min-h-screen w-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${Data_security_02})` }}
        >
          <div className=" bg-opacity-70 backdrop-filter backdrop-blur-[5px] p-8 rounded-xl shadow-lg w-full max-w-md text-center">
            <h1 className="text-3xl font-semibold mb-6 text-white">
              Sign In with Google
            </h1>
            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
            </div>
          </div>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}
