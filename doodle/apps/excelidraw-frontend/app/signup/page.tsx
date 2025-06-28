"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import api from "@/components/api";
import { toast, ToastContainer } from "react-toastify";

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      console.log("Attempting signup with:", {
        name: formData.name,
        email: formData.email,
      });

      const response = await api.post("/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log("Signup response:", response.data);

      if (response.status < 200 || response.status >= 300) {
        toast.error("Failed to sign up");
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
          name: formData.name, // Use the name from the form
        };
      } else {
        console.error("No user data found in response:", response.data);
        toast.error("Invalid response from server");
        return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("Sign up successful:", response.data);
      toast.success("Sign up successful!");

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Sign up error:", error);

      if (error.response) {
        // Server responded with error status
        console.error("Error response:", error.response.data);
        toast.error(
          error.response.data.message || "Error signing up. Please try again."
        );
      } else if (error.request) {
        // Network error
        console.error("Network error:", error.request);
        toast.error("Network error. Please check your connection.");
      } else {
        // Other error
        toast.error("Error signing up. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/40 via-accent/40 to-secondary/40 animate-gradient-x relative">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="w-full max-w-md rounded-2xl border border-white/20 p-8 shadow-lg bg-black/30 backdrop-blur-md animate-fade-in-down relative z-10">
          <h2 className="text-2xl font-semibold text-center mb-6 text-white">
            Create your account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm mb-1 text-white/90"
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-white/30 bg-black/40 text-white placeholder-white/40 focus:ring-2 focus:ring-white/50 focus:outline-none transition-all"
              />
            </div>

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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm mb-1 text-white/90"
              >
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-xl border border-white/30 bg-black/40 text-white placeholder-white/40 focus:ring-2 focus:ring-white/50 focus:outline-none transition-all"
              />
            </div>

            <Button variant="primary" size="lg" className="w-full btn-gradient">
              Sign Up
            </Button>
          </form>

          <p className="mt-4 text-sm text-center text-white/90">
            Already have an account?{" "}
            <a href="/signin" className="text-white hover:underline">
              Sign in
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
