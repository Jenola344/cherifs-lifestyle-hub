'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, ChevronDown, User as UserIcon, LogIn } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import NotificationCenter from './NotificationCenter';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { totalItems } = useCart();
    const { user, isAuthenticated } = useUser();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    Cherif’s Lifestyle Hub
                </Link>

                {/* Desktop Menu */}
                <div className={styles.desktopMenu}>
                    <Link href="/" className={styles.navLink}>Home</Link>
                    <Link href="/about" className={styles.navLink}>About</Link>
                    <div className={styles.dropdown}>
                        <span className={styles.navLink}>Gallery <ChevronDown size={14} /></span>
                        <div className={styles.dropdownContent}>
                            <Link href="/shop#interior">Interior Design</Link>
                            <Link href="/shop">Art Collection</Link>
                            <Link href="/shop#lifestyle">Lifestyle</Link>
                        </div>
                    </div>
                    <Link href="/contact" className={styles.navLink}>Contact</Link>

                    <div className={styles.iconGroup}>
                        {isAuthenticated ? (
                            <Link href="/profile" className={styles.iconBtn}>
                                <UserIcon size={20} />
                                <span className={styles.label}>{user?.name.split(' ')[0]}</span>
                            </Link>
                        ) : (
                            <Link href="/auth" className={styles.iconBtn}>
                                <LogIn size={20} />
                            </Link>
                        )}

                        <Link href="/cart" className={styles.cartBtn}>
                            <ShoppingBag size={20} />
                            {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
                        </Link>

                        <NotificationCenter />
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={styles.mobileToggle}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                    <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link>
                    <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                    {isAuthenticated ? (
                        <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>Profile ({user?.name})</Link>
                    ) : (
                        <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>Login / Register</Link>
                    )}
                    <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>Cart ({totalItems})</Link>
                </div>
            )}
        </nav>
    );
}
