"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth.context";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Login successful! Redirecting...");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error: unknown) {
      // Handle both Error objects and our custom AuthError object
      let errorMessage = "Login failed. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12 lg:py-0">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12 group">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 group-hover:shadow-lg transition-shadow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">SIRVA</span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Sign in to your account to continue with your security assessments.
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-8 border-slate-200 shadow-lg dark:bg-slate-900 dark:border-slate-800">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-slate-700 font-medium text-sm dark:text-slate-300"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  disabled={authLoading}
                  {...register("email")}
                  className={`h-11 dark:bg-slate-950 dark:border-slate-700 dark:text-white ${
                    errors.email ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 font-medium text-sm dark:text-slate-300"
                  >
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    disabled={authLoading}
                    {...register("password")}
                    className={`h-11 pr-10 dark:bg-slate-950 dark:border-slate-700 dark:text-white ${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register("rememberMe")}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer dark:border-slate-600 dark:bg-slate-950 dark:checked:bg-blue-600"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm text-slate-600 cursor-pointer dark:text-slate-400"
                >
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={authLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  New to SIRVA?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Button
              asChild
              variant="outline"
              className="w-full h-11 border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white dark:hover:text-white"
            >
              <Link href="/auth/signup">Create an Account</Link>
            </Button>
          </Card>

          {/* Footer Links */}
          <p className="text-center text-sm text-slate-600 mt-8 dark:text-slate-500">
            By signing in, you agree to our{" "}
            <Link
              href="#"
              className="text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        {/* Image Container - Full Coverage */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src="/assets/login-hero.jpg"
            alt="Security Assessment"
            fill
            className="object-cover object-right"
          />
        </div>
      </div>
    </div>
  );
}
