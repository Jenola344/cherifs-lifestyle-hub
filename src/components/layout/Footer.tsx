'use client';

import { Instagram, Mail, MapPin, MessageCircle, Send, Music } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';
import styles from './Footer.module.css';

export default function Footer() {

    return (
        <footer className={styles.footer} id="contact">
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.faqSection}>
                        <h2 className={styles.heading}>Frequently Asked Questions</h2>
                        <div className={styles.faqList}>
                            <div className={styles.faqItem}>
                                <h3 className={styles.faqQuestion}>Do you ship internationally?</h3>
                                <p className={styles.faqAnswer}>Yes, we provide luxury shipping for all art acquisitions worldwide, ensuring every piece arrives in pristine condition.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h3 className={styles.faqQuestion}>Are the art pieces original?</h3>
                                <p className={styles.faqAnswer}>Absolutely. Every piece in our collection is either a unique original or a certified limited edition masterpiece.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h3 className={styles.faqQuestion}>Can I request a custom design?</h3>
                                <p className={styles.faqAnswer}>Yes, Cherif’s Lifestyle Hub specializes in bespoke interior architecture. Book a consultation to discuss your vision.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h3 className={styles.faqQuestion}>How do I track my acquisition?</h3>
                                <p className={styles.faqAnswer}>Members can track their order status directly from their profile page. We also provide email updates upon status changes.</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <h2 className={styles.branding}>Cherif’s Lifestyle Hub</h2>
                        <div className={styles.contactDetails}>
                            <div className={styles.contactItem}>
                                <Mail size={18} />
                                <a href={`mailto:${APP_CONFIG.contactEmail}`}>{APP_CONFIG.contactEmail}</a>
                            </div>
                            <div className={styles.contactItem}>
                                <Instagram size={18} />
                                <a href={APP_CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer">@cheriflifestylegallery</a>
                            </div>
                            <div className={styles.contactItem}>
                                <MessageCircle size={18} />
                                <a href={APP_CONFIG.socials.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp Hub</a>
                            </div>
                            <div className={styles.contactItem}>
                                <MapPin size={18} />
                                <span>Lagos / Global Studio</span>
                            </div>
                        </div>

                        <div className={styles.socialIconsGrid}>
                            <a href={APP_CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                <Instagram size={20} />
                            </a>
                            <a href={APP_CONFIG.socials.tiktok} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                <Music size={20} />
                            </a>
                            <a href={APP_CONFIG.socials.telegram} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                <Send size={20} />
                            </a>
                            <a href={APP_CONFIG.socials.snapchat} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c-1.2 0-2.4.5-3.3 1.4A4.7 4.7 0 0 0 7.3 8c0 1 .3 1.7.6 2.5a13 13 0 0 1-1.3 5.4c-.4.8-1 1.4-1.6 1.9-.3.2-.5.5-.4.8.1.3.4.4.7.4H19c.3 0 .6-.1.7-.4s-.1-.6-.4-.8c-.6-.5-1.2-1.1-1.6-1.9-.6-1.6-1-3.4-1.3-5.4.3-.8.6-1.5.6-2.5 0-1.5-.5-2.8-1.4-3.6C14.4 3.5 13.2 3 12 3z" /><path d="M10 21c0 1.1.9 2 2 2s2-.9 2-2" /></svg>
                            </a>
                        </div>

                        <div className={styles.copyright}>
                            © {new Date().getFullYear()} Cherif’s Lifestyle Hub. All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
