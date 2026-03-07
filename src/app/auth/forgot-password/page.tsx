'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import styles from '../Auth.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to process request');

            setMessage({ type: 'success', text: data.message });
            setEmail('');
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
                    <h1 className={styles.title}>Forgot Password</h1>
                    <p className={styles.subtitle}>Enter your email address to receive a password reset link.</p>

                    {message.text && (
                        <div className={`${styles.alert} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
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

                        <Button type="submit" variant="primary" className={styles.btn} disabled={loading}>
                            {loading ? 'Processing...' : 'Send Reset Link'}
                        </Button>
                    </form>

                    <div className={styles.footer} style={{ marginTop: '2rem' }}>
                        Remember your password?{' '}
                        <Link href="/auth" className={styles.toggle} style={{ textDecoration: 'underline' }}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
