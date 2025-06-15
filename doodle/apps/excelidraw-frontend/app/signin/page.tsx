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
    try {
      const response = await api.post("/signin", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      if (response.status < 200 || response.status >= 300) {
        toast.error("Failed to sign in");
      }
      const data = response.data;
      
      console.log("Sign in successful:", data);
      toast.success("Sign in successful:", data);
      // Redirect to dashboard or home page after successful sign in
      router.push("/dashboard");
    } catch (error) {
      toast.error("Error signing in. Please try again.");
      console.error("Sign in error:", error);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/20 to-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-muted p-8 shadow-lg bg-background/80 backdrop-blur-md">
          <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
            Sign in to your account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm mb-1 text-muted-foreground"
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
                className="w-full px-4 py-2 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm mb-1 text-muted-foreground"
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
                className="w-full px-4 py-2 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              />
            </div>

            <Button variant="primary" size="lg" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="mt-4 text-sm text-center text-muted-foreground">
            Don&#39;t have an account?{" "}
            <a href="/signup" className="text-primary hover:underline">
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