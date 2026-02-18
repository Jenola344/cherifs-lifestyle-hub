'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Heart, ShoppingBag, Star, Send, Trash2 } from 'lucide-react';
import styles from './Profile.module.css';

export default function ProfilePage() {
    const { user, logout, toggleFavorite, isAuthenticated } = useUser();
    const [orders, setOrders] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<'orders' | 'favorites'>('orders');

    // Feedback state
    const [feedback, setFeedback] = useState({ rating: 5, message: '' });
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth');
            return;
        }

        const fetchData = async () => {
            try {
                const [ordersRes, artRes] = await Promise.all([
                    fetch('/api/orders'),
                    fetch('/api/art')
                ]);

                if (ordersRes.ok) {
                    const allOrders = await ordersRes.json();
                    const userOrders = allOrders.filter((o: any) => o.userEmail === user?.email);
                    setOrders(userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                }

                if (artRes.ok) {
                    const allArt = await artRes.json();
                    const userFavs = allArt.filter((item: any) => user?.favorites?.includes(item.id));
                    setFavorites(userFavs);
                }
            } catch (error) {
                console.error('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, router, user?.email, user?.favorites]);

    const handleFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingFeedback(true);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: user?.name,
                    email: user?.email,
                    rating: feedback.rating,
                    message: feedback.message
                })
            });
            if (res.ok) {
                setFeedbackSent(true);
                setFeedback({ rating: 5, message: '' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Hello, {user?.name}</h1>
                        <p className={styles.email}>{user?.email}</p>
                    </div>
                    <button onClick={logout} className={styles.logout}>Logout</button>
                </header>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tabBtn} ${activeSubTab === 'orders' ? styles.tabActive : ''}`}
                        onClick={() => setActiveSubTab('orders')}
                    >
                        <ShoppingBag size={18} /> Order History
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeSubTab === 'favorites' ? styles.tabActive : ''}`}
                        onClick={() => setActiveSubTab('favorites')}
                    >
                        <Heart size={18} /> Favorites
                    </button>
                </div>

                <section className={styles.section}>
                    {activeSubTab === 'orders' ? (
                        <>
                            <h2 className={styles.sectionTitle}>Your Acquisitions</h2>
                            {loading ? (
                                <p>Loading your collections...</p>
                            ) : orders.length === 0 ? (
                                <div className={styles.empty}>
                                    <p>You haven't acquired any masterpieces yet.</p>
                                    <Button href="/shop" variant="primary">Explore Art Collection</Button>
                                </div>
                            ) : (
                                <div className={styles.orderList}>
                                    {orders.map(order => (
                                        <div key={order.id} className={styles.orderCard}>
                                            <div className={styles.orderHeader}>
                                                <span>Order #{order.id.slice(0, 8)}</span>
                                                <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className={styles.orderItems}>
                                                {order.items.map((item: any, idx: number) => (
                                                    <div key={idx} className={styles.item}>
                                                        <span>{item.title} (x{item.quantity})</span>
                                                        <span>₦{item.price.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={styles.orderFooter}>
                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span className={styles.total}>Total: ₦{order.totalPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h2 className={styles.sectionTitle}>Saved for Inspiration</h2>
                            {loading ? (
                                <p>Loading favorites...</p>
                            ) : favorites.length === 0 ? (
                                <div className={styles.empty}>
                                    <p>Your inspiration board is empty.</p>
                                    <Button href="/shop" variant="primary">Discover Art</Button>
                                </div>
                            ) : (
                                <div className={styles.favGrid}>
                                    {favorites.map(item => (
                                        <div key={item.id} className={styles.favCard} onClick={() => router.push(`/shop`)}>
                                            <div className={styles.favImg} style={{ backgroundImage: `url(${item.image})` }} />
                                            <div className={styles.favInfo}>
                                                <div>
                                                    <h3>{item.title}</h3>
                                                    <p>{item.artist}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                                    className={styles.removeFav}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>

                <section className={styles.feedbackSection}>
                    <div className={styles.feedbackCard}>
                        <h2>Share Your Experience</h2>
                        <p>We value your feedback on our service and overall brand experience.</p>

                        {feedbackSent ? (
                            <div className={styles.success}>
                                <Star size={40} className={styles.goldStar} />
                                <h3>Thank you for your feedback!</h3>
                                <p>Your contribution helps us refine the Cherif experience.</p>
                                <button onClick={() => setFeedbackSent(false)} className={styles.resetBtn}>Send another feedback</button>
                            </div>
                        ) : (
                            <form onSubmit={handleFeedback} className={styles.feedbackForm}>
                                <div className={styles.starsInput}>
                                    {[...Array(5)].map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setFeedback({ ...feedback, rating: i + 1 })}
                                        >
                                            <Star size={30} fill={i < feedback.rating ? "var(--color-black)" : "none"} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    placeholder="Tell us about your full experience with the brand..."
                                    value={feedback.message}
                                    onChange={e => setFeedback({ ...feedback, message: e.target.value })}
                                    rows={4}
                                    required
                                />
                                <Button type="submit" variant="primary" disabled={isSubmittingFeedback}>
                                    {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'} <Send size={18} />
                                </Button>
                            </form>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
