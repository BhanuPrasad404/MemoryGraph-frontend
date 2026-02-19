'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // React Query Mutation for login
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.login(email, password),
    onSuccess: (data) => {
      console.log("LOGIN SUCCESS DATA:", data);

      if (data.success) {
        try {
          apiClient.setToken(data.data.token);
          console.log("TOKEN SET SUCCESS");
        } catch (e) {
          console.error("TOKEN SET FAILED:", e);
        }

        toast.success('Welcome back!');
        console.log("PUSHING TO DASHBOARD");
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Login failed');
      }
    },

    onError: (error: any) => {
      const message = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 text-center relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl rounded-full" />

        {/* Main heading with gradient */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome back
          </span>
        </h1>

        {/* Subtitle with subtle gradient */}
        <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto relative">
          <span className="relative inline-block">
            Enter your credentials to continue
            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
          </span>
        </p>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-150" />
          <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse delay-300" />
        </div>
      </div>

      <Card className="border-0 bg-gray-900/90 backdrop-blur-sm shadow-2xl shadow-purple-500/5 overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-lg text-gray-100">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  required
                  autoComplete="email"
                  className="pl-10 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loginMutation.isPending}
                  required
                  autoComplete="current-password"
                  className="pl-10 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                />
              </div>
            </div>

            {loginMutation.isError && (
              <Alert variant="destructive" className="border-red-900 bg-red-950/50">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {loginMutation.error?.response?.data?.error || 'Login failed'}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link
              href="/signup"
              className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}