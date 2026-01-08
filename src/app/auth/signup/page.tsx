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
import { Shield, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import authService from "@/services/auth.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["AM", "SO"]).refine((val) => val, {
    message: "Please select a role",
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
      });
      
      toast.success("Account created successfully!");
      
      // Redirect to login after short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage = "Registration failed. Please try again.";
      // Extract message from our custom AuthError
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      console.error("Signup error object:", error); // Log full error object
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 group">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 group-hover:shadow-lg transition-shadow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">SIRVA</span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Join the platform to manage security assessments efficiently.
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-8 border-slate-200 shadow-lg dark:bg-slate-900 dark:border-slate-800">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-700 font-medium text-sm dark:text-slate-300">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    disabled={isLoading}
                    {...register("firstName")}
                    className={`dark:bg-slate-950 dark:border-slate-700 dark:text-white ${errors.firstName ? "border-red-500" : ""}`}
                  />
                  {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-700 font-medium text-sm dark:text-slate-300">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    disabled={isLoading}
                    {...register("lastName")}
                    className={`dark:bg-slate-950 dark:border-slate-700 dark:text-white ${errors.lastName ? "border-red-500" : ""}`}
                  />
                  {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium text-sm dark:text-slate-300">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  disabled={isLoading}
                  {...register("email")}
                  className={`dark:bg-slate-950 dark:border-slate-700 dark:text-white ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium text-sm dark:text-slate-300">Role <span className="text-red-500">*</span></Label>
                <Select 
                  onValueChange={(val) => setValue("role", val as "AM" | "SO", { shouldValidate: true })}
                  defaultValue={selectedRole}
                  disabled={isLoading}
                >
                  <SelectTrigger className={`dark:bg-slate-950 dark:border-slate-700 dark:text-white ${errors.role ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                    <SelectItem value="AM" className="dark:text-slate-200 dark:focus:bg-slate-800">Application Manager (AM)</SelectItem>
                    <SelectItem value="SO" className="dark:text-slate-200 dark:focus:bg-slate-800">Security Officer (SO)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-red-600">{errors.role.message}</p>}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedRole === 'AM' && "You will create and manage security dossiers."}
                  {selectedRole === 'SO' && "You will review and validate security assessments."}
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium text-sm dark:text-slate-300">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    disabled={isLoading}
                    {...register("password")}
                    className={`pr-10 dark:bg-slate-950 dark:border-slate-700 dark:text-white ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium text-sm dark:text-slate-300">Confirm Password <span className="text-red-500">*</span></Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                  className={`dark:bg-slate-950 dark:border-slate-700 dark:text-white ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600 dark:text-slate-400">Already have an account? </span>
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                Sign in
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-slate-900/90 z-10"></div>
        <Image
          src="/assets/login-hero.jpg"
          alt="Security Team"
          fill
          className="object-cover"
        />
        
        <div className="relative z-20 max-w-lg text-center px-8">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
              <CheckCircle2 className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Start Your Security Journey</h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Create an account to access automated risk analysis, architecture validation, and comprehensive security reporting tools.
          </p>
        </div>
      </div>
    </div>
  );
}
