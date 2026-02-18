'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import Button from '@/components/ui/Button';
import styles from './Auth.module.css';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login: setUserLogin } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: isLogin ? 'login' : 'register',
                    email,
                    password,
                    name: isLogin ? undefined : name
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            setUserLogin(data);
            router.push('/profile');
        } catch (error: any) {
            alert(error.message);
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
