"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import api from "@/components/api";
import { toast, ToastContainer } from "react-toastify";

export default function SignInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signing in with:", formData);

    // Test backend connectivity first
    try {
      console.log("Testing backend connectivity...");
      const healthResponse = await api.get("/health");
      console.log("Backend health check:", healthResponse.data);
    } catch (healthError) {
      console.error("Backend health check failed:", healthError);
      toast.error("Cannot connect to server. Please try again later.");
      return;
    }

    try {
      const response = await api.post("/signin", formData);

      console.log("Signin response:", response.data);

      if (response.status < 200 || response.status >= 300) {
        toast.error("Failed to sign in");
        return;
      }

      // Check if response has the expected data
      if (!response.data.token) {
        console.error("Unexpected response format:", response.data);
        toast.error("Invalid response from server");
        return;
      }

      // Handle both userId and user object formats
      let userData;
      if (response.data.user) {
        // New format with user object
        userData = response.data.user;
      } else if (response.data.userId) {
        // Old format with userId - create a minimal user object
        userData = {
          id: response.data.userId,
          email: formData.email, // Use the email from the form
          name: "User", // Default name since we don't have it
        };
      } else {
        console.error("No user data found in response:", response.data);
        toast.error("Invalid response from server");
        return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      const data = response.data;

      console.log("Sign in successful:", data);
      toast.success("Sign in successful!");

      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Sign in error:", error);

      if (error && typeof error === "object" && "response" in error) {
        // Server responded with error status
        const axiosError = error as {
          response: { data: { message?: string } };
        };
        console.error("Error response:", axiosError.response.data);
        toast.error(
          axiosError.response.data.message ||
            "Error signing in. Please try again."
        );
      } else if (error && typeof error === "object" && "request" in error) {
        // Network error
        console.error("Network error:", error);
        toast.error("Network error. Please check your connection.");
      } else {
        // Other error
        toast.error("Error signing in. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/40 via-accent/40 to-secondary/40 animate-gradient-x relative">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="w-full max-w-md rounded-2xl border border-white/20 p-8 shadow-lg bg-black/30 backdrop-blur-md animate-fade-in-down relative z-10">
          <h2 className="text-2xl font-semibold text-center mb-6 text-white">
            Sign in to your account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm mb-1 text-white/90"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-white/30 bg-black/40 text-white placeholder-white/40 focus:ring-2 focus:ring-white/50 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm mb-1 text-white/90"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-white/30 bg-black/40 text-white placeholder-white/40 focus:ring-2 focus:ring-white/50 focus:outline-none transition-all"
              />
            </div>

            <Button variant="primary" size="lg" className="w-full btn-gradient">
              Sign In
            </Button>
          </form>

          <p className="mt-4 text-sm text-center text-white/90">
            Don&#39;t have an account?{" "}
            <a href="/signup" className="text-white hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-card text-card-foreground border border-border"
      />
    </>
  );
}
