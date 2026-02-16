'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle, Loader2, Lock, Sparkles, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!regex.test(email)) return 'Please enter a valid email address';
        return '';
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setEmailError(validateEmail(value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const error = validateEmail(email);
        if (error) {
            setEmailError(error);
            toast.error(error);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send reset link');

            setSent(true);
            toast.success('Reset link sent successfully!', {
                description: `We've sent a password reset link to ${email}`,
                duration: 5000,
            });
        } catch (err: any) {
            toast.error('Failed to send reset link', {
                description: err.message || 'Please try again later',
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-8">
                <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-6 sm:p-8 border border-blue-100">
                        <div className="flex flex-col items-center text-center">
                            {/* Animated Success Icon */}
                            <div className="mb-6 relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse shadow-xl">
                                    <CheckCircle className="w-12 h-12 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2">
                                    <div className="w-6 h-6 bg-purple-500 rounded-full animate-bounce flex items-center justify-center text-white text-xs">✓</div>
                                </div>
                                <div className="absolute -bottom-2 -left-2">
                                    <div className="w-4 h-4 bg-pink-500 rounded-full animate-ping" />
                                </div>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                                Check Your Email!
                            </h3>

                            <div className="space-y-4 w-full">
                                <p className="text-gray-600 text-sm sm:text-base">
                                    We've sent a magic link to:
                                </p>
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-purple-200 shadow-inner">
                                    <p className="font-mono text-sm sm:text-base font-semibold text-purple-700 break-all">
                                        {email}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 text-left">
                                    <p className="text-sm text-amber-800 flex items-start gap-2">
                                        <span className="text-lg">📧</span>
                                        <span>
                                            <span className="font-semibold">Didn't receive the email?</span>
                                            <br />
                                            <span className="text-amber-700">Check spam folder or click below</span>
                                        </span>
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                    <Button
                                        onClick={() => setSent(false)}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2 inline" />
                                        Send Another Link
                                    </Button>
                                    <Link href="/login" className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full border-2 border-purple-200 hover:border-purple-300 bg-white hover:bg-purple-50 font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 text-purple-700"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to Login
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-8">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500" />
            </div>

            <div className="w-full max-w-md mb-4 relative z-10">
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 transition-colors group bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>
            </div>

            <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-700 relative z-10">
                <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 sm:p-8 border border-purple-100">

                    {/* Colorful Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl rotate-3 hover:rotate-0 transition-transform">
                                <Mail className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                ✨
                            </div>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Forgot Password?
                            </span>
                        </h1>

                        <p className="text-gray-600 text-sm sm:text-base text-center max-w-sm bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full">
                            No worries! We'll help you reset it.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-sm sm:text-base font-medium text-gray-700 block"
                            >
                                Email Address
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 group-focus-within:text-purple-600 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    onBlur={() => setEmailError(validateEmail(email))}
                                    placeholder="your@email.com"
                                    required
                                    aria-invalid={!!emailError}
                                    aria-describedby={emailError ? "email-error" : undefined}
                                    className={`
                                        pl-10 pr-4 py-3 sm:py-3.5 text-sm sm:text-base
                                        border-2 rounded-xl transition-all duration-200
                                        focus:ring-4 focus:ring-purple-100 focus:border-purple-400
                                        ${emailError
                                            ? 'border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400'
                                            : 'border-gray-200 hover:border-purple-300 bg-white/50'
                                        }
                                    `}
                                />
                                {!emailError && email && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    </div>
                                )}
                            </div>
                            {emailError && (
                                <p id="email-error" className="text-xs sm:text-sm text-red-600 mt-1.5 flex items-center bg-red-50 px-3 py-1 rounded-full">
                                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mr-2" />
                                    {emailError}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !email || !!emailError}
                            className={`
                                w-full font-semibold py-3 sm:py-3.5 px-4 rounded-xl
                                text-sm sm:text-base relative overflow-hidden group
                                transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${!loading && !emailError && email
                                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent font-bold">
                                        Sending Magic Link...
                                    </span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <Lock className="w-4 h-4 mr-2" />
                                    Send Reset Link
                                    <Sparkles className="w-4 h-4 ml-2 opacity-70" />
                                </span>
                            )}
                            {!loading && !emailError && email && (
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            )}
                        </Button>

                        <p className="text-xs sm:text-sm text-gray-600 text-center mt-6 bg-gradient-to-r from-transparent via-purple-50 to-transparent py-2">
                            Remember your password?{' '}
                            <Link
                                href="/login"
                                className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>

                    {/* Security Features */}
                    <div className="mt-8 pt-6 border-t border-purple-100">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                </div>
                                <p className="text-xs text-blue-600">Encrypted</p>
                            </div>
                            <div className="text-center">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                    <Lock className="w-4 h-4 text-purple-600" />
                                </div>
                                <p className="text-xs text-purple-600">Secure</p>
                            </div>
                            <div className="text-center">
                                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                    <CheckCircle className="w-4 h-4 text-pink-600" />
                                </div>
                                <p className="text-xs text-pink-600">Private</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}