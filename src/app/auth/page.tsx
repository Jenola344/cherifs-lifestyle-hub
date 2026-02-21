'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import styles from './Auth.module.css';

function AuthContent() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for success/error in URL (from email verification)
    useEffect(() => {
        const error = searchParams.get('error');
        const success = searchParams.get('success');
        if (error === 'invalid_verification') setMessage({ type: 'error', text: 'Invalid or expired verification link.' });
        if (success === 'verified') setMessage({ type: 'success', text: 'Email verified! You can now sign in.' });
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

                if (result?.error) throw new Error('Invalid email or password');
                router.push('/profile');
            } else {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Registration failed');

                setMessage({ type: 'success', text: 'Registration successful! Please check your email to verify your account.' });
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
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button type="submit" variant="primary" className={styles.btn} disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
                        </Button>
                    </form>

                    <div className={styles.divider}>
                        <span>OR</span>
                    </div>

                    <Button
                        onClick={() => signIn('google', { callbackUrl: '/profile' })}
                        variant="outline"
                        className={styles.googleBtn}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18" />
                        Sign in with Google
                    </Button>

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
