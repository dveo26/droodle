"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import api from "@/components/api";
export default function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error when user makes changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/signup", formData);

      if (response.data.success) {
        // Redirect to dashboard or home page after successful signup
        router.push("./signin");
      } else {
        setError(
          response.data.message || "Something went wrong. Please try again."
        );
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to sign up. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/20 to-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-muted p-8 shadow-lg bg-background/80 backdrop-blur-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
          Create your account
        </h2>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm mb-1 text-muted-foreground"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
            />
          </div>

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
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
            />
          </div>

          <Button variant="primary" size="lg" className="w-full">
            Sign up
          </Button>
        </form>

        <p className="mt-4 text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <a href="/signin" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
