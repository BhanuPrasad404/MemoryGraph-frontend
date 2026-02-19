'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const signupMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.signup(email, password),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Account created! Please verify your email.');
        router.push('/login?message=verify-email');
      } else {
        toast.error(data.error || 'Signup failed');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Signup failed');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    signupMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-10 text-center relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl rounded-full" />

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create your account
          </span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto relative">
          <span className="relative inline-block">
            Start building your personal knowledge graph
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

      {/* Card */}
      <Card className="border-0 bg-gray-900/90 backdrop-blur-sm shadow-2xl shadow-purple-500/5 overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-gray-300">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="name"
                  className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={signupMutation.isPending}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-300">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={signupMutation.isPending}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={signupMutation.isPending}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Minimum 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-600 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={signupMutation.isPending}
                  required
                />
              </div>
            </div>

            {/* Error */}
            {signupMutation.isError && (
              <Alert variant="destructive" className="border-red-900 bg-red-950/50">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  Signup failed. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </Button>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}