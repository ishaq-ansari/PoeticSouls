import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, signUp } from "@/lib/auth";

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const signUpSchema = z.object({
  displayName: z
    .string()
    .min(3, { message: "Display name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  useRealName: z.boolean().default(true),
});

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSignIn?: (data: z.infer<typeof signInSchema>) => void;
  onSignUp?: (data: z.infer<typeof signUpSchema>) => void;
  defaultTab?: "signIn" | "signUp";
}

const AuthModal = ({
  isOpen = true,
  onClose = () => {},
  onSignIn,
  onSignUp,
  defaultTab = "signIn",
}: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<"signIn" | "signUp">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [useRealName, setUseRealName] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      useRealName: true,
    },
  });

  const handleSignIn = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await signIn(data as { email: string; password: string });

      if (result.error) {
        setError(result.error.message || "Invalid email or password. Please try again.");
        return;
      }

      if (onSignIn) {
        onSignIn(data);
      }
      onClose();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await signUp({
        ...data,
        useRealName,
      } as { displayName: string; email: string; password: string; useRealName: boolean
      });

      if (result.error) {
        console.error("Signup error details:", result.error);
        
        // Check if this is a "confirmation required" message
        if (result.error.message?.includes("check your email")) {
          setSuccess(result.error.message);
          // Optionally switch to sign-in tab after account creation
          setActiveTab("signIn");
          signInForm.setValue("email", data.email);
          setIsLoading(false);
          return;
        }
        
        // Handle email already registered
        if (result.error.message?.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.");
          setActiveTab("signIn");
          signInForm.setValue("email", data.email);
          return;
        } else {
          setError(result.error.message || "Failed to create account. Please try again.");
          return;
        }
      }

      // If we have auto-confirmation enabled, directly log in
      if (result.data?.session) {
        setSuccess("Account created successfully!");
        
        if (onSignUp) {
          onSignUp({ ...data, useRealName });
        }
        onClose();
      } else {
        // No session means email confirmation is likely required
        setSuccess("Account created! Please check your email to confirm your account before signing in.");
        setActiveTab("signIn");
        signInForm.setValue("email", data.email);
      }
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleNameType = () => {
    setUseRealName(!useRealName);
    signUpForm.setValue("useRealName", !useRealName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-center">
            Poetic Souls
          </DialogTitle>
          <DialogDescription className="text-center">
            Join our community of poetry enthusiasts
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs
          defaultValue={defaultTab}
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as "signIn" | "signUp");
            setError(null);
            setSuccess(null);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signIn">Sign In</TabsTrigger>
            <TabsTrigger value="signUp">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signIn" className="space-y-4">
            <Form {...signInForm}>
              <form
                onSubmit={signInForm.handleSubmit(handleSignIn)}
                className="space-y-4"
              >
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            className="pl-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-7 w-7"
                          onClick={togglePasswordVisibility}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="signUp" className="space-y-4">
            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(handleSignUp)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <FormLabel>Display Name</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant={useRealName ? "default" : "outline"}
                        size="sm"
                        onClick={toggleNameType}
                        className="text-xs h-7 px-2"
                        disabled={isLoading}
                      >
                        Real Name
                      </Button>
                      <Button
                        type="button"
                        variant={!useRealName ? "default" : "outline"}
                        size="sm"
                        onClick={toggleNameType}
                        className="text-xs h-7 px-2"
                        disabled={isLoading}
                      >
                        Pseudonym
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={signUpForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              placeholder={
                                useRealName ? "Your Name" : "Your Pseudonym"
                              }
                              className="pl-10"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            className="pl-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-7 w-7"
                          onClick={togglePasswordVisibility}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col space-y-2">
          <div className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
