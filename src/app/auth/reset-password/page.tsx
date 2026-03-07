'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import styles from '../Auth.module.css';

function ResetPasswordContent() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const searchParams = useSearchParams();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return setMessage({ type: 'error', text: 'Passwords do not match.' });
        }

        if (!token || !email) {
            return setMessage({ type: 'error', text: 'Invalid password reset link.' });
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to reset password');

            setMessage({ type: 'success', text: 'Password reset successful! You can now sign in.' });
            setNewPassword('');
            setConfirmPassword('');
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
                    <h1 className={styles.title}>Set New Password</h1>
                    <p className={styles.subtitle}>Enter your new password below.</p>

                    {message.text && (
                        <div className={`${styles.alert} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.group}>
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className={styles.group}>
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Button type="submit" variant="primary" className={styles.btn} disabled={loading}>
                            {loading ? 'Processing...' : 'Reset Password'}
                        </Button>
                    </form>

                    <div className={styles.footer} style={{ marginTop: '2rem' }}>
                        <Link href="/auth" className={styles.toggle} style={{ textDecoration: 'underline' }}>
                            Back to Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className={styles.main}>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
