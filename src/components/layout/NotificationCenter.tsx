'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, X, Info, Tag, Package, Star } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import styles from './NotificationCenter.module.css';
import Link from 'next/link';

export default function NotificationCenter() {
    const { user, isAuthenticated } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`/api/notifications?userId=${user?.id}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                const unread = data.filter((n: any) => !n.readBy?.includes(user?.id)).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error('Fetch notifications failed', error);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId, userId: user?.id })
            });
            if (res.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Mark as read failed', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'new_art': return <Tag size={16} />;
            case 'sold_out': return <Package size={16} />;
            case 'order_status': return <Package size={16} />;
            case 'discount': return <Tag size={16} />;
            case 'greeting': return <Star size={16} />;
            default: return <Info size={16} />;
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className={styles.notificationWrapper} ref={dropdownRef}>
            <button className={styles.bellBtn} onClick={() => setIsOpen(!isOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Notifications</h3>
                        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}><X size={16} /></button>
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <p>No notifications yet.</p>
                            </div>
                        ) : (
                            notifications.map((n: any) => (
                                <div
                                    key={n.id}
                                    className={`${styles.item} ${!n.readBy?.includes(user?.id) ? styles.unread : ''}`}
                                    onClick={() => {
                                        if (!n.readBy?.includes(user?.id)) markAsRead(n.id);
                                        if (n.link) setIsOpen(false);
                                    }}
                                >
                                    <div className={`${styles.icon} ${styles[n.type]}`}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className={styles.body}>
                                        <div className={styles.itemHeader}>
                                            <span className={styles.title}>{n.title}</span>
                                            <span className={styles.time}>{new Date(n.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className={styles.message}>{n.message}</p>
                                        {n.link && (
                                            <Link href={n.link} className={styles.link}>View Details</Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
