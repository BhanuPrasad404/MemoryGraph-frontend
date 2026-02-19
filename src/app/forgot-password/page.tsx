// app/forgot-password/page.tsx
import ForgotPasswordForm from '@/components/auth/ForgotPassword';
import Link from 'next/link';
import { Brain } from 'lucide-react';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
            {/* Background Decoration - Subtle gradient orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
            </div>

            {/* Simple Header - Optional, you can add if you want consistency with login/signup */}
            <div className="absolute top-0 left-0 right-0 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <div className="container p-4 flex h-16 items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20 group-hover:shadow-purple-600/30 transition-all">
                            <Brain className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">MemoryGraph AI</span>
                    </Link>
                </div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-purple-500/5 rounded-2xl overflow-hidden border border-gray-800 animate-fade-in">
                    {/* Top Gradient Bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    
                    <div className="p-8">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Reset Your Password
                                </span>
                            </h1>
                            <p className="text-gray-500 mt-2 text-sm">
                                Enter your email to receive a secure password reset link
                            </p>
                            
                            {/* Decorative dots */}
                            <div className="flex justify-center gap-2 mt-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-150" />
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse delay-300" />
                            </div>
                        </div>

                        {/* Form */}
                        <ForgotPasswordForm />

                        {/* Back to login */}
                        <div className="mt-6 text-center text-sm text-gray-500">
                            <Link
                                href="/login"
                                className="font-medium text-purple-400 hover:text-purple-300 hover:underline transition-colors inline-flex items-center gap-1"
                            >
                                <span>←</span> Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 py-4 bg-gray-900/50 backdrop-blur-sm">
                <div className="container text-center text-xs text-gray-600">
                    © {new Date().getFullYear()} MemoryGraph AI. Secure password reset.
                </div>
            </div>
        </div>
    );
}