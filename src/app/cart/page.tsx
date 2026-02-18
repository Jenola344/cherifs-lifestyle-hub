'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Trash2, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import styles from './Cart.module.css';

export default function Cart() {
    const { cart, removeFromCart, clearCart, totalPrice } = useCart();
    const { user, isAuthenticated } = useUser();
    const [customerName, setCustomerName] = useState(user?.name || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user) setCustomerName(user.name);
    }, [user]);

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            router.push('/auth?redirect=/cart');
            return;
        }

        if (!customerName.trim()) {
            alert('Please enter your name to complete the order.');
            return;
        }

        setIsSubmitting(true);

        const orderData = {
            customerName,
            userEmail: user?.email,
            items: cart,
            totalPrice,
            platform: 'web-whatsapp'
        };

        try {
            // Fetch configuration first
            const configRes = await fetch('/api/admin/login');
            const { whatsappNumber } = await configRes.json();

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Failed to create order');

            // WhatsApp Messaging
            let message = `Hello Cherif's Lifestyle Hub, I would like to place an order for:\n\n`;
            cart.forEach(item => {
                message += `🎨 *${item.title}*\n`;
                message += `   Size: ${item.size || 'N/A'}\n`;
                message += `   Frame: ${item.frame || 'Frameless'}\n`;
                message += `   Price: ₦${item.price}\n`;
                message += `   Qty: ${item.quantity}\n`;
                message += `   Preview: ${item.image}\n\n`;
            });
            message += `*Total Order Value: ₦${totalPrice.toLocaleString()}*\n`;
            message += `*Customer:* ${customerName}\n`;
            message += `*Email:* ${user?.email}\n\n`;
            message += "Please provide the secure account details for payment completion.";

            const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

            window.open(url, '_blank');
            alert('Order registered! Redirecting to WhatsApp concierge...');
            clearCart();
        } catch (error) {
            alert('There was an error processing your order.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <main className={styles.emptyCart}>
                <h1>Your Art Collection is Empty</h1>
                <p>Start curating your space with pieces that resonate with your identity.</p>
                <Button href="/shop" variant="primary">Explore Collection</Button>
            </main>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.topActions}>
                    <Link href="/shop" className={styles.backLink}>
                        <ArrowLeft size={18} /> Continue Curation
                    </Link>
                </div>

                <h1 className={styles.title}>Your Collection</h1>

                <div className={styles.content}>
                    <div className={styles.itemList}>
                        {cart.map(item => (
                            <div key={item.cartId} className={styles.item}>
                                <div className={styles.itemInfo}>
                                    <div
                                        className={styles.itemImage}
                                        style={{ backgroundImage: `url(${item.image})` }}
                                    />
                                    <div>
                                        <h3 className={styles.itemTitle}>{item.title}</h3>
                                        <p className={styles.itemMeta}>
                                            {item.size} • {item.frame}
                                        </p>
                                        <p className={styles.itemPrice}>₦{item.price.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className={styles.itemActions}>
                                    <span className={styles.quantity}>Qty: {item.quantity}</span>
                                    <button onClick={() => removeFromCart(item.cartId)} className={styles.removeBtn}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Acquisition Summary</h2>
                        <div className={styles.row}>
                            <span>Subtotal</span>
                            <span>₦{cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()}</span>
                        </div>
                        <div className={styles.row}>
                            <span>Framing Premium</span>
                            <span>
                                ₦{cart.reduce((acc, item) => acc + (item.frame === 'Framed' ? 150 * item.quantity : 0), 0).toLocaleString()}
                            </span>
                        </div>
                        <div className={styles.divider} />
                        <div className={`${styles.row} ${styles.total}`}>
                            <span>Total</span>
                            <span>₦{totalPrice.toLocaleString()}</span>
                        </div>

                        <div className={styles.checkoutForm}>
                            <label>Acquisition Name</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Full Name"
                                disabled={!isAuthenticated}
                            />
                            {!isAuthenticated && (
                                <div className={styles.lockOverlay}>
                                    <Lock size={16} />
                                    <span>Please <Link href="/auth">Sign in</Link> to checkout</span>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handleCheckout}
                            variant="primary"
                            className={styles.checkoutBtn}
                            disabled={isSubmitting || !isAuthenticated}
                        >
                            {!isAuthenticated ? 'Sign in to Checkout' : isSubmitting ? 'Securing Acquisition...' : 'CHECKOUT'}
                        </Button>

                        <div className={styles.trustBadge}>
                            <ShieldCheck size={16} /> Member-Only Secure Checkout
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
