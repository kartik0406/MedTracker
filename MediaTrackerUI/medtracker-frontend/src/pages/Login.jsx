import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";

export default function Login() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      // Show error to user if needed
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={handleLogin}
        className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold"
      >
        Sign in with Microsoft
      </button>
    </div>
  );
}
