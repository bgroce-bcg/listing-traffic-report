"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, UserPlus, Mail, Lock, User, Eye, EyeOff, ShieldAlert, ShieldCheck, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signupSchema, type SignupFormData, getPasswordStrength } from "@/lib/validations/auth"
import { useAuth } from "@/contexts/auth-context"

export default function SignupPage() {
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    },
  })

  const password = form.watch("password")
  const passwordStrength = getPasswordStrength(password)

  async function onSubmit(data: SignupFormData) {
    setIsLoading(true)
    setError(null)

    try {
      const { error: signUpError } = await signUp(data.email, data.password, data.fullName)

      if (signUpError) {
        // Provide user-friendly error messages
        if (signUpError.message.includes("User already registered")) {
          setError("An account with this email already exists. Please sign in instead.")
        } else if (signUpError.message.includes("Password should be at least")) {
          setError("Password must be at least 8 characters long.")
        } else {
          setError(signUpError.message)
        }
        return
      }

      // Success - show confirmation message
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  // Show success message after signup
  if (success) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="rounded-full bg-green-500 p-3">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Account created!</CardTitle>
          <CardDescription className="text-center text-foreground/80">
            Welcome to Real Estate Traffic Report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Your account has been created successfully. You can now sign in and start tracking your property listings.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Continue to sign in
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="relative">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="rounded-full bg-primary p-3">
            <UserPlus className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        <CardDescription className="text-center text-foreground/80">
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-foreground/60" />
                      <Input
                        placeholder="John Doe"
                        type="text"
                        autoComplete="name"
                        className="pl-10"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-foreground/60" />
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        autoComplete="email"
                        className="pl-10"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground/60" />
                      <Input
                        placeholder="Create a strong password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-foreground/60 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  {password && password.length > 0 && (
                    <div className="mt-2 space-y-2" role="status" aria-live="polite">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ease-in-out ${
                              passwordStrength.label === "Weak"
                                ? "bg-destructive w-1/4"
                                : passwordStrength.label === "Fair"
                                ? "bg-yellow-500 w-1/2"
                                : passwordStrength.label === "Good"
                                ? "bg-blue-500 w-3/4"
                                : "bg-green-500 w-full"
                            }`}
                            style={{
                              backgroundImage: passwordStrength.label === "Weak"
                                ? "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)"
                                : passwordStrength.label === "Fair"
                                ? "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)"
                                : "none"
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1 min-w-[80px]">
                          {passwordStrength.label === "Weak" && (
                            <ShieldAlert
                              className="h-3.5 w-3.5 text-destructive flex-shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          {passwordStrength.label === "Fair" && (
                            <Shield
                              className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500 flex-shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          {(passwordStrength.label === "Good" || passwordStrength.label === "Strong") && (
                            <ShieldCheck
                              className={`h-3.5 w-3.5 flex-shrink-0 ${
                                passwordStrength.label === "Good"
                                  ? "text-blue-600 dark:text-blue-500"
                                  : "text-green-600 dark:text-green-500"
                              }`}
                              aria-hidden="true"
                            />
                          )}
                          <span
                            className={`text-xs font-semibold ${
                              passwordStrength.label === "Weak"
                                ? "text-destructive"
                                : passwordStrength.label === "Fair"
                                ? "text-yellow-600 dark:text-yellow-500"
                                : passwordStrength.label === "Good"
                                ? "text-blue-600 dark:text-blue-500"
                                : "text-green-600 dark:text-green-500"
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/70">
                        Use 8+ characters with uppercase, lowercase, numbers, and symbols
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground/60" />
                      <Input
                        placeholder="Re-enter your password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-foreground/60 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full relative"
              disabled={isLoading}
            >
              <span className={isLoading ? "opacity-0" : ""}>Create account</span>
              {isLoading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Creating account...</span>
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full text-foreground/70">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary hover:underline font-medium underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}