'use client';

import { Instagram, Mail, MapPin } from 'lucide-react';
import Button from '../ui/Button';
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
                                <a href="mailto:hello@cherifslifestylehub.com">hello@cherifslifestylehub.com</a>
                            </div>
                            <div className={styles.contactItem}>
                                <Instagram size={18} />
                                <a href="https://instagram.com/cherifslifestylehub" target="_blank" rel="noopener noreferrer">@cherifslifestylehub</a>
                            </div>
                            <div className={styles.contactItem}>
                                <MapPin size={18} />
                                <span>Lagos / Global Studio</span>
                            </div>
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
