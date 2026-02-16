// app/forgot-password/page.tsx
import ForgotPasswordForm from '@/components/auth/ForgotPassword';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fade-in">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        Reset Your Password
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Enter your email to receive a secure password reset link
                    </p>
                </div>

                {/* Form */}
                <ForgotPasswordForm />

                {/* Back to login */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <Link
                        href="/login"
                        className="font-medium text-blue-600 hover:underline"
                    >
                        ← Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
