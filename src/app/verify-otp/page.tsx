'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VerifyOtpPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });

        setLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        // OTP verified → session created
        router.push('/reset-password');
    };

    return (
        <form onSubmit={handleVerify} className="space-y-4">
            <Input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
            />
            <Button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
        </form>
    );
}
