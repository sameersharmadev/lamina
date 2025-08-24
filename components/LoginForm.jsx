'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Mail, X, Github } from 'lucide-react';
import { toast } from 'sonner';

const generateGamerTag = () => {
    const adjectives = [
        'Epic', 'Legendary', 'Mystic', 'Shadow', 'Cosmic', 'Neon', 'Digital', 'Cyber',
        'Quantum', 'Blazing', 'Thunder', 'Frost', 'Crimson', 'Azure', 'Golden', 'Silver',
        'Dark', 'Bright', 'Swift', 'Stealth', 'Plasma', 'Volt', 'Nova', 'Void',
        'Prism', 'Nexus', 'Matrix', 'Binary', 'Pixel', 'Glitch', 'Turbo', 'Hyper',
        'Ultra', 'Mega', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Prime',
        'Toxic', 'Savage', 'Wild', 'Rogue', 'Ghost', 'Phantom', 'Spectre', 'Venom',
        'Storm', 'Blaze', 'Freeze', 'Shock', 'Chaos', 'Order', 'Light', 'Darkness'
    ];

    const nouns = [
        'Wolf', 'Dragon', 'Phoenix', 'Raven', 'Tiger', 'Falcon', 'Viper', 'Shark',
        'Hunter', 'Warrior', 'Knight', 'Assassin', 'Ninja', 'Samurai', 'Reaper', 'Guardian',
        'Demon', 'Angel', 'Spirit', 'Phantom', 'Ghost', 'Wraith', 'Spectre', 'Shadow',
        'Blade', 'Sword', 'Arrow', 'Bullet', 'Lightning', 'Thunder', 'Storm', 'Fire',
        'Ice', 'Steel', 'Iron', 'Diamond', 'Crystal', 'Gem', 'Star', 'Moon',
        'Sun', 'Comet', 'Meteor', 'Galaxy', 'Nebula', 'Cosmos', 'Void', 'Nexus',
        'Core', 'Edge', 'Pulse', 'Wave', 'Flux', 'Node', 'Code', 'Byte',
        'Bit', 'Data', 'Sync', 'Link', 'Net', 'Web', 'Grid', 'Zone'
    ];

    const suffixes = [
        'X', 'Pro', 'Max', 'Ultra', 'Prime', 'Elite', 'Master', 'Lord',
        'King', 'Queen', 'Boss', 'Chief', 'Alpha', 'Beta', 'Omega', 'Zero',
        '99', '100', '2000', '3000', 'XL', 'HD', '4K', '8K'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    // Sometimes add a suffix, sometimes just a number
    const addSuffix = Math.random() > 0.5;
    let username;

    if (addSuffix && Math.random() > 0.3) {
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        username = `${adjective}${noun}${suffix}`;
    } else {
        const number = Math.floor(Math.random() * 9999) + 1;
        username = `${adjective}${noun}${number}`;
    }

    return username;
};

export function LoginForm() {
    const router = useRouter();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    const toggleForm = () => {
        setIsSignup((prev) => !prev);
        setShowBanner(false);
    };

    const handleEmailAuth = async () => {
        if (isSignup && password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);
        let error;

        if (isSignup) {
            // Generate a cool gamertag for new signups
            const gamerTag = generateGamerTag();

            const { error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/`,
                    data: {
                        full_name: gamerTag,
                        username: gamerTag
                    }
                },
            });
            error = signupError;
        } else {
            const { error: signinError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            error = signinError;
        }

        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            if (isSignup) {
                setShowBanner(true);
                toast.success('Check your email to confirm your account!');
            } else {
                toast.success('Logged in successfully!');
                router.push('/');
            }
        }
    };

    const handleOAuthLogin = async (provider) => {
        setOauthLoading(provider);

        const gamerTag = generateGamerTag();

        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                data: {
                    username: gamerTag
                }
            },
        });

        if (error) {
            toast.error(error.message);
        }

        setOauthLoading('');
    };

    return (
        <div className="flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-lg space-y-6">
                {showBanner && (
                    <div className="backdrop-blur-md bg-yellow-200/70 dark:bg-yellow-700/70 text-yellow-900 dark:text-yellow-100 border border-yellow-400/30 dark:border-yellow-300/20 shadow-md px-4 py-3 rounded-md flex items-center justify-between">
                        <span>Check your email to verify account!</span>
                        <button
                            onClick={() => setShowBanner(false)}
                            className="ml-4 text-yellow-900 dark:text-yellow-100 hover:text-yellow-600 dark:hover:text-yellow-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}


                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">
                        {isSignup ? 'Create an account' : 'Welcome back'}
                    </h1>
                    <p className="text-muted-foreground text-base">
                        {isSignup ? 'Start your journey with Lamina' : 'Sign in to continue'}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="username@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="text-lg"
                        />
                    </div>

                    <div className="space-y-2 relative">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="text-lg pr-10"
                            />
                            <button
                                type="button"
                                onMouseDown={() => setShowPassword(true)}
                                onMouseUp={() => setShowPassword(false)}
                                onMouseLeave={() => setShowPassword(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {isSignup && (
                        <div className="space-y-2 relative">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="text-lg pr-10"
                                />
                                <button
                                    type="button"
                                    onMouseDown={() => setShowConfirmPassword(true)}
                                    onMouseUp={() => setShowConfirmPassword(false)}
                                    onMouseLeave={() => setShowConfirmPassword(false)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleEmailAuth}
                        className="w-full text-base py-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                {isSignup ? 'Signing up...' : 'Logging in...'}
                            </>
                        ) : (
                            <>
                                <Mail className="w-5 h-5 mr-2" />
                                {isSignup ? 'Sign up' : 'Login'}
                            </>
                        )}
                    </Button>

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthLogin('google')}
                            disabled={oauthLoading === 'google'}
                        >
                            {oauthLoading === 'google' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    <svg
                                        role="img"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 fill-current"
                                    >
                                        <title>Google</title>
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                    </svg>
                                    Google
                                </span>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthLogin('github')}
                            disabled={oauthLoading === 'github'}
                        >
                            {oauthLoading === 'github' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Github className="w-5 h-5" />
                                    GitHub
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="text-center text-sm pt-2">
                    {isSignup ? (
                        <>
                            Already have an account?{' '}
                            <button
                                onClick={toggleForm}
                                className="underline text-primary hover:opacity-80"
                            >
                                Login
                            </button>
                        </>
                    ) : (
                        <>
                            Don't have an account?{' '}
                            <button
                                onClick={toggleForm}
                                className="underline text-primary hover:opacity-80"
                            >
                                Sign up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
