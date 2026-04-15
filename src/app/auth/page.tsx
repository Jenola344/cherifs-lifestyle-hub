'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import styles from './Auth.module.css';

function AuthContent() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for success/error in URL (from email verification)
    useEffect(() => {
        const error = searchParams.get('error');
        const success = searchParams.get('success');
        const verified = searchParams.get('verified');
        if (error === 'invalid_verification') setMessage({ type: 'error', text: 'Invalid or expired verification link.' });
        if (success === 'verified' || verified === 'true') setMessage({ type: 'success', text: 'Email verified! You can now sign in.' });
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (isLogin) {
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false
                });

                if (result?.error) {
                    // Check if it's the verification error specifically, or just throw the error message
                    throw new Error(result.error);
                }
                router.push('/');
            } else {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Registration failed');

                setMessage({ type: 'success', text: data.message || 'Registration successful! You can now sign in.' });
                setIsLogin(true);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.box}>
                    <h1 className={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p className={styles.subtitle}>
                        {isLogin ? 'Enter your details to access your collection' : 'Join our artistic community today'}
                    </p>

                    {message.text && (
                        <div className={`${styles.alert} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {!isLogin && (
                            <div className={styles.group}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        )}
                        <div className={styles.group}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="hello@example.com"
                                required
                            />
                        </div>
                        <div className={styles.group}>
                            <label>Password</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className={styles.passwordInput}
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {isLogin && (
                                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                    <Link href="/auth/forgot-password" className={styles.toggle} style={{ fontSize: '0.85rem' }}>
                                        Forgot Password?
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Button type="submit" variant="primary" className={styles.btn} disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button onClick={() => setIsLogin(!isLogin)} className={styles.toggle}>
                            {isLogin ? 'Create one' : 'Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className={styles.loader}>Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}
