'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/client';
import { toast } from 'sonner';

export default function VerifyPage() {
    const router = useRouter();

    useEffect(() => {
        const handleHashToken = async () => {
            // 🔥 GET TOKEN FROM HASH, NOT SEARCHPARAMS!
            const hash = window.location.hash.substring(1); // Remove #
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const type = params.get('type');

            console.log('Hash:', hash);
            console.log('Access token:', accessToken ? '✅ Present' : '❌ Missing');
            console.log('Type:', type);

            if (!accessToken || type !== 'recovery') {
                toast.error('Invalid reset link');
                router.replace('/login');
                return;
            }

            // ✅ Set the session manually
            const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: params.get('refresh_token') || '',
            });

            if (error) {
                console.error('Session error:', error);
                toast.error(error.message);
                router.replace('/login');
                return;
            }

            console.log('Session set! Redirecting...');
            router.replace('/auth/reset-password');
        };

        handleHashToken();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4">Verifying your reset link...</p>
            </div>
        </div>
    );
}