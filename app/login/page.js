'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoginForm } from '@/components/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                router.replace('/'); // or '/dashboard'
            }
        };
        checkSession();
    }, [router]);
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
            {/* Left Login Form */}
            <div className="flex flex-col justify-center items-center p-8">
                <div className="w-full max-w-sm">
                    <LoginForm />
                </div>
            </div>

            {/* Right Visual Panel */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] p-10">
                <div className="text-center space-y-6">
                    <Image
                        src="/login-image.png"
                        alt=""
                        width={350}
                        height={90}
                        className="rounded-xl shadow-2xl"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                   
                </div>
            </div>
        </div>
    );
}
